"""
routes_spatial.py — Spatial AI Chatbot
========================================================
Menangani endpoint:
  - POST /api/chat/spatial
"""
from flask import request, jsonify, session
import json
import re
import math
from config import app, driver, HAS_GIS
from ai_engine import call_llm
from mode_sumber_daya import get_sumber_daya_instruction
from mode_celah_masalah import get_celah_masalah_instruction
from mode_analisis_teknis import get_analisis_teknis_instruction
from mode_simulasi_modal import get_simulasi_modal_instruction
from mode_simulasi_lapangan_kerja import get_simulasi_lapangan_kerja_instruction


def haversine_distance(lat1, lon1, lat2, lon2):
    """Hitung jarak antara dua koordinat lat/lng dalam meter menggunakan formula Haversine."""
    R = 6371000  # Radius Bumi dalam meter
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def is_point_in_polygon(lat, lng, polygon_coords):
    """Deteksi apakah sebuah titik berada di dalam poligon (Ray-casting Algorithm)."""
    inside = False
    n = len(polygon_coords)
    if n < 3:
        return False
    p1x, p1y = polygon_coords[0]
    for i in range(n + 1):
        p2x, p2y = polygon_coords[i % n]
        if lng > min(p1y, p2y):
            if lng <= max(p1y, p2y):
                if lat <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (lng - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or lat <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside


@app.route("/api/chat/spatial", methods=["POST"])
def spatial_chat():
    """
    Chatbot Strategis: Fokus pada kecepatan dan ketepatan radius.
    Menghapus semua bottleneck pencarian yang lambat.
    """
    try:
        data               = request.get_json()
        prompt             = data.get("prompt", "")
        mode               = data.get("mode", "default")
        actors_in_radius   = data.get("actors", [])
        polygons_in_radius = data.get("polygons", [])
        pinned_center      = data.get("pinnedCenter")
        radius             = data.get("radius", 500)
        location_name      = data.get("location_name", "Area Target")
        media_data         = data.get("media_data")

        # Authenticated User for DB Memory
        user_id = session.get("user") or session.get("moderator") or "guest_spatial"

        # ------------------------------------------------------------------
        # 1. KONSTRUKSI KONTEKS DATA (REAL-TIME)
        # ------------------------------------------------------------------
        context_text = f"### ANALISIS RADIUS ###\n"
        if pinned_center:
            lat = pinned_center.get('lat', 0)
            lng = pinned_center.get('lng', 0)
            context_text += f"- Lokasi Nyata: *{location_name}*\n"
            context_text += f"- Koordinat Pusat: {lat:.6f}, {lng:.6f}\n"
            context_text += f"- Jangkauan Radius: {radius} meter\n"
        context_text += "\n"

        # Ambil detail poligon dari Neo4j (untuk mengetahui tipe marker, populasi, catatan/notes)
        polygon_details = {}
        poly_ids = [p.get('id') for p in polygons_in_radius if p.get('id')]
        if poly_ids:
            query_polys = """
            MATCH (a:Actor)
            WHERE a.id IN $ids AND a.type = "aktorLokasi"
            RETURN a.id AS id, a.name AS name, a.marker_type AS marker_type, a.raw_data AS raw_data
            """
            try:
                with driver.session() as neo_session:
                    records = neo_session.run(query_polys, ids=poly_ids)
                    for rec in records:
                        raw = {}
                        if rec["raw_data"]:
                            try:
                                raw = json.loads(rec["raw_data"])
                            except Exception:
                                pass
                        polygon_details[rec["id"]] = {
                            "name": rec["name"],
                            "marker_type": rec["marker_type"] or raw.get("Marker Type", "Wilayah"),
                            "populasi": raw.get("Populasi", "Tidak diketahui"),
                            "notes": raw.get("Notes", raw.get("Catatan", ""))
                        }
            except Exception as e:
                print(f"[routes_spatial] Failed to fetch polygons: {e}")

        # Filter poligon spasial yang masuk dalam jangkauan
        polygons_to_include = []
        for poly in polygons_in_radius:
            poly_id = poly.get('id')
            poly_coords = poly.get('coords', [])
            
            in_range = False
            if not pinned_center:
                in_range = True
            else:
                c_lat = pinned_center.get('lat', 0)
                c_lng = pinned_center.get('lng', 0)
                # 1. Cek apakah titik pusat ada di dalam poligon
                if is_point_in_polygon(c_lat, c_lng, poly_coords):
                    in_range = True
                else:
                    # 2. Cek apakah ada koordinat poligon yang berada dalam radius
                    for pt in poly_coords:
                        if len(pt) >= 2:
                            if haversine_distance(c_lat, c_lng, pt[0], pt[1]) <= radius:
                                in_range = True
                                break
            
            if in_range:
                details = polygon_details.get(poly_id, {})
                polygons_to_include.append({
                    "id": poly_id,
                    "name": poly.get('name', details.get("name", "Wilayah")),
                    "marker_type": details.get("marker_type", "Wilayah"),
                    "populasi": details.get("populasi", "Tidak diketahui"),
                    "notes": details.get("notes", "")
                })

        if not actors_in_radius and not polygons_to_include:
            context_text += "STATUS: Radius ini belum memiliki data aktor atau area terpetakan.\n"
        else:
            if actors_in_radius:
                context_text += f"STRUKTUR EKOSISTEM ({len(actors_in_radius)} entitas terdeteksi):\n"

                # Ambil detail aktor komprehensif (Produk+Harga Rp, Celah Masalah, Profesi SDM+Gaji, Promotion Page Text, Kampanye/Lowongan Notes) dari Neo4j
                actor_ids = [a.get('id') for a in actors_in_radius if a.get('id')]
                actor_details = {}
                if actor_ids:
                    query_details = """
                    MATCH (a:Actor)
                    WHERE a.id IN $ids
                    OPTIONAL MATCH (a)-[:MENAWARKAN]->(p:ProdukLayanan)
                    OPTIONAL MATCH (a)-[:MENGHADAPI_KENDALA]->(m:CelahMasalah)
                    OPTIONAL MATCH (a)-[:MEMBUTUHKAN_SDM]->(s:Profesi)
                    RETURN a.id AS id, 
                           a.promotion_page_text AS promotion_page_text, 
                           a.fokus_usaha AS fokus_usaha,
                           a.raw_data AS raw_data,
                           collect(DISTINCT {nama: p.nama, harga: p.harga, satuan: p.satuan}) AS produk_list,
                           collect(DISTINCT {isu: m.isu, dampak: m.dampak}) AS masalah_list,
                           collect(DISTINCT {posisi: s.posisi, gaji: s.gaji_estimasi}) AS sdm_list
                    """
                    try:
                        with driver.session() as neo_session:
                            for rec in neo_session.run(query_details, ids=actor_ids):
                                raw = {}
                                if rec["raw_data"]:
                                    try:
                                        raw = json.loads(rec["raw_data"])
                                    except Exception:
                                        pass
                                actor_details[rec["id"]] = {
                                    "promotion_page_text": rec["promotion_page_text"] or "",
                                    "fokus_usaha": rec["fokus_usaha"] or "",
                                    "raw_data": raw,
                                    "produk_list": [p for p in rec["produk_list"] if p.get("nama")],
                                    "masalah_list": [m for m in rec["masalah_list"] if m.get("isu")],
                                    "sdm_list": [s for s in rec["sdm_list"] if s.get("posisi")]
                                }
                    except Exception as e:
                        print(f"[routes_spatial] Failed to fetch actor details: {e}")

                # Process Kampanye & Lowongan dengan Pengecekan Expiration & Random Sampling
                import random
                from datetime import datetime

                today_str = datetime.now().strftime("%Y-%m-%d")
                
                # Identifikasi Aktor AI-Pin (Aktor paling dekat dengan pinned_center jika ada)
                pinned_actor_id = None
                if pinned_center and actors_in_radius:
                    c_lat = pinned_center.get('lat', 0)
                    c_lng = pinned_center.get('lng', 0)
                    # Cari aktor paling dekat dengan titik pusat
                    closest_dist = float('inf')
                    for a in actors_in_radius:
                        a_lat = a.get('lat') or a.get('latitude') or 0
                        a_lng = a.get('lng') or a.get('longitude') or 0
                        if a_lat and a_lng:
                            dist = haversine_distance(c_lat, c_lng, float(a_lat), float(a_lng))
                            if dist < closest_dist:
                                closest_dist = dist
                                pinned_actor_id = a.get('id')

                # Kumpulkan semua aktor yang memiliki Kampanye / Lowongan AKTIF
                active_promo_actors = []
                for a in actors_in_radius:
                    a_id = a.get('id', '')
                    details = actor_details.get(a_id, {})
                    raw = details.get("raw_data", {})
                    
                    notes_type = raw.get("NotesType") or raw.get("notesType")
                    notes_end = raw.get("NotesEndDate") or raw.get("notesEndDate")
                    notes_disabled = raw.get("NotesDisabled", False)
                    
                    # Validasi: Harus memiliki tipe (kampanye/lowongan), tidak disabled, dan belum kedaluwarsa
                    if notes_type in ["kampanye", "lowongan"] and not notes_disabled:
                        is_active = True
                        if notes_end:
                            try:
                                # Jika format tanggal YYYY-MM-DD
                                if len(notes_end) >= 10 and notes_end[:10] < today_str:
                                    is_active = False
                            except Exception:
                                pass
                        
                        if is_active:
                            active_promo_actors.append(a_id)

                # Logika Pemilihan Promo untuk AI:
                # - Aktor AI-Pin SELALU diikutkan (jika punya promo aktif)
                # - Untuk Non-AI Pin yang banyak, ambil secara RANDOM (maksimal 2 promo non-pin) untuk meminimalisir promosi berlebihan
                selected_promo_ids = set()
                if pinned_actor_id and pinned_actor_id in active_promo_actors:
                    selected_promo_ids.add(pinned_actor_id)
                
                non_pinned_active_promos = [aid for aid in active_promo_actors if aid != pinned_actor_id]
                if non_pinned_active_promos:
                    # Random sample max 2 promo non-pin
                    num_to_sample = min(2, len(non_pinned_active_promos))
                    sampled = random.sample(non_pinned_active_promos, num_to_sample)
                    for aid in sampled:
                        selected_promo_ids.add(aid)

                for a in actors_in_radius:
                    name   = a.get('name', 'Unknown')
                    a_type = a.get('type', 'Aktor')
                    a_id   = a.get('id', '')
                    details = actor_details.get(a_id, {})
                    fokus_usaha = details.get("fokus_usaha", "")
                    lp_text = details.get("promotion_page_text", "")
                    produk_list = details.get("produk_list", [])
                    masalah_list = details.get("masalah_list", [])
                    sdm_list = details.get("sdm_list", [])
                    raw = details.get("raw_data", {})

                    context_text += f"- **Aktor [[{name}|{a_id}]]** ({a_type})\n"
                    if fokus_usaha:
                        context_text += f"  - Fokus Usaha: {fokus_usaha}\n"
                    if produk_list:
                        prod_str = ", ".join([f"{p['nama']} (Rp {p['harga']:,}/{p.get('satuan','item')})" for p in produk_list])
                        context_text += f"  - Produk & Harga (Rp): {prod_str}\n"
                    if masalah_list:
                        mas_str = ", ".join([f"{m['isu']}" for m in masalah_list])
                        context_text += f"  - Celah Masalah/Kendala: {mas_str}\n"
                    if sdm_list:
                        sdm_str = ", ".join([f"{s['posisi']} (Gaji: Rp {s['gaji']:,}/bln)" for s in sdm_list])
                        context_text += f"  - Kebutuhan Tenaga Kerja & Gaji: {sdm_str}\n"

                    # Masukkan Informasi Kampanye / Lowongan AKTIF jika terpilih
                    if a_id in selected_promo_ids:
                        notes_type = raw.get("NotesType") or raw.get("notesType")
                        notes_name = raw.get("NotesName") or raw.get("notesName") or raw.get("Notes") or raw.get("Catatan")
                        notes_desc = raw.get("NotesDescription") or raw.get("notesDescription") or raw.get("Deskripsi")
                        notes_start = raw.get("NotesStartDate") or raw.get("notesStartDate")
                        notes_end = raw.get("NotesEndDate") or raw.get("notesEndDate")
                        cta_text = raw.get("CtaText") or raw.get("ctaText") or "Hubungi / Detail"
                        cta_url = raw.get("CtaUrl") or raw.get("ctaUrl") or raw.get("CtaWa") or raw.get("ctaWa")

                        is_pinned_actor = (a_id == pinned_actor_id)
                        priority_tag = "[UTAMA/AI-PIN TARGET]" if is_pinned_actor else "[PROMO SAMPEL RADIUS]"

                        context_text += f"  - **PROGRAM PROMOSI AKTIF {priority_tag}**:\n"
                        context_text += f"    * Jenis: {notes_type.upper()}\n"
                        if notes_name:
                            context_text += f"    * Nama Aktivitas: {notes_name}\n"
                        if notes_desc:
                            context_text += f"    * Deskripsi: {notes_desc}\n"
                        if cta_text or cta_url:
                            context_text += f"    * CTA / Kontak: {cta_text} ({cta_url})\n"

                    if lp_text:
                        short_lp = lp_text[:150] + "..." if len(lp_text) > 150 else lp_text
                        context_text += f"  - Ringkasan Promosi: {short_lp}\n"
                    context_text += "\n"

                # Ambil relasi dari Neo4j untuk GraphRAG
                if actor_ids:
                    query_relations = """
                    MATCH (a:Actor)-[r:SEKTOR_SAMA|MEMASOK|MEMBUTUHKAN|BUTUH_KEAHLIAN|MEMILIKI_KEAHLIAN|MENGELOLA|DIKELOLA_OLEH|TARGET_PASAR]->(b)
                    WHERE a.id IN $ids AND (b.id IN $ids OR b:Keahlian OR b:TargetMarket)
                    RETURN a.name AS source, type(r) AS rel_type, COALESCE(b.name, b.nama, b.detail) AS target
                    """
                    try:
                        with driver.session() as neo_session:
                            records = neo_session.run(query_relations, ids=actor_ids)
                            relations = []
                            for rec in records:
                                rel_map = {
                                    "SEKTOR_SAMA": "Sektor Sama",
                                    "MEMASOK": "Memasok Bahan Baku Ke",
                                    "MEMBUTUHKAN": "Membutuhkan Pasokan Dari",
                                    "BUTUH_KEAHLIAN": "Membutuhkan Keahlian",
                                    "MEMILIKI_KEAHLIAN": "Memiliki Keahlian Kerja",
                                    "MENGELOLA": "Mengelola Area",
                                    "DIKELOLA_OLEH": "Dikelola Oleh",
                                    "TARGET_PASAR": "Target Pasar"
                                }
                                rel_type = rel_map.get(rec["rel_type"], rec["rel_type"])
                                relations.append(f"- {rec['source']} -> ({rel_type}) -> {rec['target']}")
                            if relations:
                                context_text += "\nHUBUNGAN ANTAR-AKTOR (KNOWLEDGE GRAPH):\n" + "\n".join(relations) + "\n"
                    except Exception as e:
                        print(f"[routes_spatial] Failed to fetch relations: {e}")

            if polygons_to_include:
                context_text += f"\nAREA & WILAYAH SPASIAL ({len(polygons_to_include)} area terdeteksi):\n"
                for p in polygons_to_include:
                    p_name = p["name"]
                    p_id = p["id"]
                    context_text += f"- Nama Area: {p_name}, Tag AEO: [[{p_name}|{p_id}]] (Tipe: {p['marker_type']}, Populasi: {p['populasi']})"
                    if p["notes"]:
                        context_text += f" - Catatan: {p['notes']}"
                    context_text += "\n"


        # C. Prediction Trigger dihapus untuk realisme murni simulasi

        # ------------------------------------------------------------------
        # 2. RIWAYAT OBROLAN LINTAS PESAN (MULTI-TURN CHAT CONTEXT: 8 SESI PERCAKAPAN)
        # ------------------------------------------------------------------
        client_history = data.get("history")
        if client_history is not None and isinstance(client_history, list):
            chat_history = list(client_history)
        else:
            chat_history = session.get("spatial_chat_history", [])

        history_context = ""
        if chat_history:
            history_context = "### RIWAYAT PERCAKAPAN SEBELUMNYA DENGAN USER ###\n"
            for h in chat_history[-16:]:
                role_label = "Pengguna" if h.get("role") == "user" else "Asisten"
                history_context += f"{role_label}: {h.get('text', '')}\n"
            history_context += "\n"

        # ------------------------------------------------------------------
        # 3. SYSTEM PROMPT (Smart Spatial Assistant & Local Exploration Guide)
        # ------------------------------------------------------------------
        system_prompt = (
            "Anda adalah Asisten Cerdas Spasial & Pemandu Kawasan Lokal (Smart Local Guide & Spatial Explorer) yang ramah, akurat, dan adaptif terhadap niat pengguna.\n\n"
            "PRINSIP UTAMA:\n"
            "1. ADAPTIF TERHADAP MAKSUD/PERTANYAAN USER (SANGAT PENTING):\n"
            "   - Jika user bertanya sebagai KONSUMEN / PENCARI LAYANAN / MAKANAN (contoh: 'apa yang cocok untuk saya yang suka pedas', 'cari warung makan/bengkel terdekat', 'rekomendasi makanan di sini', 'ada toko apa saja'):\n"
            "     * Jawablah langsung sebagai Pemandu Lokal yang merekomendasikan tempat/usaha nyata di radius tersebut yang relevan dengan keinginan user.\n"
            "     * Berikan informasi nama tempat, menu/produk yang sesuai, perkiraan harga (jika ada), dan keunggulannya.\n"
            "     * DILARANG KERAS mengajak user membuka usaha baru, menawarkan rantai pasok, atau memaksakan strategi bisnis jika user HANYA bertanya rekomendasi/pencarian tempat/makanan.\n"
            "   - Jika user bertanya EKSPLORASI / ANALISIS SPASIAL (contoh: 'analisis persebaran toko di area ini', 'apa karakteristik wilayah ini'):\n"
            "     * Berikan ringkasan persebaran entitas dan ekosistem wilayah secara informatif dan terstruktur.\n"
            "   - Jika user secara eksplisit BERTANYA TENTANG BISNIS / PELUANG / USAHA (atau jika Mode Cipta Kerja aktif):\n"
            "     * Berikan analisis potensi pasar, celah peluang, dan strategi pengembangan usaha yang relevan.\n\n"
            "2. KEJUJURAN DATA & ANTI-HALUSINASI (GROUNDING):\n"
            "   - HANYA rekomendasikan aktor/usaha yang benar-benar tercatat di DATA RADIUS dan relevan dengan konteks pertanyaan.\n"
            "   - Jika tidak ada usaha yang sesuai dengan keinginan user di radius ini (misal: user mencari jenis makanan/layanan tertentu tetapi datanya tidak ada di radius), katakan dengan jujur bahwa belum ada pelaku usaha spesifik untuk hal tersebut di radius yang dipin, lalu sebutkan alternatif terdekat dari data yang tersedia.\n"
            "   - JANGAN mengarang nama aktor atau menganggap placeholder generik (seperti 'Aktor Usaha', 'Aktor', 'Unknown') sebagai nama toko resmi.\n\n"
            "3. TAG AEO INTERAKTIF (KLIK PETA):\n"
            "   - Setiap menyebut nama usaha/aktor atau wilayah terdaftar di radius, WAJIB gunakan format tag: [[Nama Usaha|ID]] (contoh: [[Soto Lamongan Pak Wid|PO41F5]]).\n"
            "   - DILARANG menulis ulang nama di luar tag (contoh salah: 'Soto Lamongan Pak Wid [[Soto Lamongan Pak Wid|PO41F5]]' atau '**Soto** [[Soto|ID]]'). Cukup tulis '[[Soto Lamongan Pak Wid|PO41F5]]'.\n\n"
            "4. SOFT-SELLING PROMOSI & LOWONGAN (HANYA JIKA RELEVAN):\n"
            "   - Jika aktor yang direkomendasikan memiliki program promosi/diskon/lowongan aktif yang RELEVAN dengan yang dicari user, sebutkan secara natural sebagai info tambahan.\n"
            "   - Jangan memaksakan promosi yang tidak ada hubungannya dengan pertanyaan user.\n\n"
            "5. GAYA PENYAMPAIAN:\n"
            "   - Ringkas, ramah, to-the-point, dan enak dibaca (gunakan bullet points yang rapi).\n"
            "   - Sebutkan info lokasi nyata (*Nama Lokasi*) secara natural jika tersedia.\n"
            "   - Dilarang menyebut kata 'Antigravity AI'.\n"
        )

        user_prompt = f"{history_context}DATA RADIUS:\n{context_text}\n\nPERINTAH USER: {prompt}"

        # Inject spesifik prompt berdasarkan mode Cipta Kerja
        if mode != "default":
            mode_instructions = {
                "sumber-daya": get_sumber_daya_instruction(),
                "celah-masalah": get_celah_masalah_instruction(),
                "analisis": get_analisis_teknis_instruction(),
                "simulasi-modal": get_simulasi_modal_instruction(),
                "simulasi-lapangan-kerja": get_simulasi_lapangan_kerja_instruction()
            }
            if mode in mode_instructions:
                user_prompt += f"\n\n[INSTRUKSI KHUSUS MODE {mode.upper()}]:\nTolong FOKUSKAN jawaban Anda secara detail, realistis, dan terstruktur sesuai kerangka berikut:\n{mode_instructions[mode]}"

        # 4. PANGGIL LLM (Stateless untuk Kecepatan Real-Time)
        reply = call_llm(system_prompt=system_prompt, user_prompt=user_prompt, temperature=0.7, media_data=None)

        # Simpan ke riwayat sesi percakapan (8 sesi = 16 pesan user & asisten)
        chat_history.append({"role": "user", "text": prompt})
        chat_history.append({"role": "assistant", "text": reply})
        updated_history = chat_history[-16:]
        session["spatial_chat_history"] = updated_history

        return jsonify({
            "success": True, 
            "reply": reply,
            "context": context_text,
            "history": updated_history
        })

    except Exception as e:
        print(f"[routes_spatial] Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/spatial/pin", methods=["POST"])
def save_spatial_pin():
    """Simpan pin secara ringan ke Neo4j."""
    data = request.get_json()
    if driver:
        with driver.session(database="neo4j") as session:
            session.run("MATCH (f:FocusArea) DETACH DELETE f")
            session.run("CREATE (f:FocusArea {lat: $lat, lng: $lng, radius: $radius})",
                        lat=data.get("lat"), lng=data.get("lng"), radius=data.get("radius"))
    return jsonify({"success": True})

