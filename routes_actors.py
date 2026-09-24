"""
routes_actors.py — API CRUD Aktor di Knowledge Graph Neo4j
===========================================================
Menangani:
  - POST /api/actor/save   : simpan/update aktor ke Neo4j + embedding
  - GET  /api/actors       : ambil semua aktor dari Neo4j
  - POST /api/actor/delete : hapus aktor dari Neo4j
  - GET  /api/health       : cek status server & model
"""
import json
import uuid

from flask import request, jsonify, render_template, session, redirect, url_for

from config import app, driver, client_embed, EMBED_MODEL


# ---------------------------------------------------------------
# HELPER: Buat Embedding Teks (Semantic Search)
# ---------------------------------------------------------------
def get_embedding(text: str) -> list:
    """Buat vector embedding dari teks menggunakan OpenAI Embeddings API."""
    response = client_embed.embeddings.create(model=EMBED_MODEL, input=text)
    return response.data[0].embedding


def extract_entities_via_llm(name, fokus_usaha, marker_type, promotion_page_text, neo_session):
    """Mengekstrak entitas relasi semantik secara cerdas menggunakan LLM berdasarkan data aktor, termasuk Produk & Harga (Rp)."""
    from ai_engine import call_llm

    # 1. Ambil daftar Keahlian dan TargetMarket yang ada di database Neo4j agar LLM memetakan ke node yang tepat
    keahlian_list = [r["name"] for r in neo_session.run("MATCH (k:Keahlian) WHERE k.nama <> '' RETURN k.nama AS name")]
    target_market_list = [r["detail"] for r in neo_session.run("MATCH (t:TargetMarket) WHERE t.detail <> '' RETURN t.detail AS detail")]

    # Buat deskripsi teks gabungan untuk dibaca LLM
    combined_desc = f"Nama Aktor: {name}\n"
    if fokus_usaha:
        combined_desc += f"Fokus Usaha: {fokus_usaha}\n"
    if marker_type:
        combined_desc += f"Tipe Area/Marker: {marker_type}\n"
    if promotion_page_text:
        combined_desc += f"Deskripsi Promosi Halaman: {promotion_page_text}\n"

    system_prompt = (
        "Anda adalah asisten AI ahli ekstraksi entitas untuk basis data graf (Knowledge Graph) komersial & spasial.\n"
        "Tugas Anda adalah membaca informasi bisnis/aktor lokal dan mengekstrak entitas relasi ke dalam format JSON.\n"
        "PENTING: Ekstrak produk/layanan nyata berspesifikasi HARGA (dalam Rupiah angka murni), celah masalah, profesi SDM & estimasi gaji, serta kebutuhan operasional.\n"
        "Kembalikan HANYA format JSON valid tanpa penjelasan markdown apapun."
    )

    user_prompt = f"""
Berikut adalah daftar Keahlian yang valid di database:
{json.dumps(keahlian_list, ensure_ascii=False)}

Berikut adalah daftar Target Pasar yang valid di database:
{json.dumps(target_market_list, ensure_ascii=False)}

Berikut adalah deskripsi informasi Aktor:
---
{combined_desc}
---

Ekstraksilah data di atas ke dalam format JSON berikut (semua key harus ada):
{{
  "produk_layanan": [
    {{ "nama": "nama produk/jasa", "harga": 20000, "satuan": "porsi/paket/jam", "kategori": "makanan/jasa/dll" }}
  ],
  "celah_masalah": [
    {{ "isu": "kendala/masalah yang dihadapi atau diselesaikan", "dampak": "dampak ekonomi/operasional" }}
  ],
  "profesi_sdm": [
    {{ "posisi": "posisi/nama profesi yang dibutuhkan", "gaji_estimasi": 2500000, "satuan": "per bulan" }}
  ],
  "kebutuhan_operasional": ["list bahan mentah/alat/jasa pendukung yang dibutuhkan"],
  "bahan_baku_dihasilkan": ["list komoditas/bahan mentah yang dihasilkan/dijual"],
  "keahlian_dibutuhkan": ["pilih dari daftar Keahlian yang valid jika bisnis ini membutuhkan tenaga kerja dengan keahlian tersebut"],
  "keahlian_dimiliki": ["pilih dari daftar Keahlian yang valid jika aktor ini menawarkan/melatih keahlian tersebut"],
  "target_pasar": ["pilih dari daftar Target Pasar yang valid atau ekstrak target segmen spesifik baru jika tidak ada di daftar"]
}}
"""
    try:
        response_text = call_llm(system_prompt, user_prompt, temperature=0.1)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        data = json.loads(response_text.strip())
        return data
    except Exception as e:
        print(f"[extract_entities_via_llm] Gagal mengekstrak entitas: {e}")
        return {
            "produk_layanan": [],
            "celah_masalah": [],
            "profesi_sdm": [],
            "kebutuhan_operasional": [],
            "bahan_baku_dihasilkan": [],
            "keahlian_dibutuhkan": [],
            "keahlian_dimiliki": [],
            "target_pasar": []
        }


def update_actor_relations(session, actor_id):
    """Membangun ulang seluruh relasi spasial & semantik komprehensif untuk aktor terkait di Neo4j."""
    # 1. Ambil data aktor terbaru dari Neo4j
    actor_info = session.run(
        "MATCH (a:Actor {id: $act_id}) RETURN a.name AS name, a.type AS type, a.fokus_usaha AS fokus_usaha, a.marker_type AS marker_type, a.promotion_page_text AS promotion_page_text",
        act_id=actor_id
    ).single()

    if not actor_info:
        return

    name = actor_info["name"] or ""
    actor_type = actor_info["type"] or ""
    fokus_usaha = actor_info["fokus_usaha"] or ""
    marker_type = actor_info["marker_type"] or ""
    promotion_page_text = actor_info["promotion_page_text"] or ""

    # a. SEKTOR_SAMA (fokus_usaha/marker_type identik)
    query_sektor = """
    MATCH (a:Actor {id: $act_id})
    OPTIONAL MATCH (a)-[r:SEKTOR_SAMA]-()
    DELETE r
    WITH a
    MATCH (b:Actor)
    WHERE a.id <> b.id 
      AND ((a.type = "aktorUsaha" AND b.type = "aktorUsaha" AND toLower(a.fokus_usaha) = toLower(b.fokus_usaha) AND a.fokus_usaha <> "")
       OR (a.type = "aktorLokasi" AND b.type = "aktorLokasi" AND toLower(a.marker_type) = toLower(b.marker_type) AND a.marker_type <> ""))
    MERGE (a)-[:SEKTOR_SAMA]->(b)
    """
    session.run(query_sektor, act_id=actor_id)

    # f. MENGELOLA / DIKELOLA_OLEH (berbasis spasial antar wilayah pemukiman dan alam)
    query_mengelola = """
    MATCH (a:Actor {id: $act_id})
    OPTIONAL MATCH (a)-[r:MENGELOLA|DIKELOLA_OLEH]-()
    DELETE r
    WITH a
    MATCH (b:Actor)
    WHERE a.id <> b.id
      AND a.lat IS NOT NULL AND a.lng IS NOT NULL
      AND b.lat IS NOT NULL AND b.lng IS NOT NULL
      AND a.lat <> 0.0 AND a.lng <> 0.0
      AND b.lat <> 0.0 AND b.lng <> 0.0
      AND (
        (toLower(a.marker_type) = "residential area" AND toLower(b.marker_type) = "natural area")
        OR
        (toLower(a.marker_type) = "natural area" AND toLower(b.marker_type) = "residential area")
      )
      AND point.distance(point({latitude: a.lat, longitude: a.lng}), point({latitude: b.lat, longitude: b.lng})) < 300
    WITH a, b,
         CASE WHEN toLower(a.marker_type) = "residential area" THEN a ELSE b END AS residential,
         CASE WHEN toLower(a.marker_type) = "residential area" THEN b ELSE a END AS natural_area
    MERGE (residential)-[:MENGELOLA]->(natural_area)
    MERGE (natural_area)-[:DIKELOLA_OLEH]->(residential)
    """
    session.run(query_mengelola, act_id=actor_id)

    # Jika aktor adalah aktor lokasi (polygon), tidak perlu mengekstrak relasi semantik via LLM
    if actor_type == "aktorLokasi":
        session.run(
            """
            MATCH (a:Actor {id: $act_id})
            OPTIONAL MATCH (a)-[r:MEMASOK|MEMBUTUHKAN|BUTUH_KEAHLIAN|MEMILIKI_KEAHLIAN|TARGET_PASAR|MENAWARKAN|MENGHADAPI_KENDALA|MEMBUTUHKAN_SDM]-()
            DELETE r
            """,
            act_id=actor_id
        )
        return

    # 2. Lakukan ekstraksi menggunakan LLM untuk aktorUsaha
    entities = extract_entities_via_llm(name, fokus_usaha, marker_type, promotion_page_text, session)

    keb_op = entities.get("kebutuhan_operasional", [])
    bhn_dihasilkan = entities.get("bahan_baku_dihasilkan", [])

    # 3. Simpan data atribut ringkas ke node Actor di Neo4j
    session.run(
        """
        MATCH (a:Actor {id: $act_id})
        SET a.bahan_baku_dibutuhkan = $keb_op,
            a.bahan_baku_dihasilkan = $bhn_dihasilkan
        """,
        act_id=actor_id,
        keb_op=keb_op,
        bhn_dihasilkan=bhn_dihasilkan
    )

    # Clean old semantic relationships
    session.run(
        """
        MATCH (a:Actor {id: $act_id})
        OPTIONAL MATCH (a)-[r:MEMASOK|MEMBUTUHKAN|BUTUH_KEAHLIAN|MEMILIKI_KEAHLIAN|TARGET_PASAR|MENAWARKAN|MENGHADAPI_KENDALA|MEMBUTUHKAN_SDM]->(n)
        DETACH DELETE r
        """,
        act_id=actor_id
    )

    # A. NODE PRODUKLAYANAN + HARGA (Rp)
    produk_list = entities.get("produk_layanan", [])
    for p in produk_list:
        p_name = p.get("nama")
        if p_name:
            session.run(
                """
                MATCH (a:Actor {id: $act_id})
                MERGE (pr:ProdukLayanan {nama: $p_name})
                SET pr.harga = $harga, pr.satuan = $satuan, pr.kategori = $kategori
                MERGE (a)-[r:MENAWARKAN]->(pr)
                SET r.harga = $harga, r.satuan = $satuan
                """,
                act_id=actor_id,
                p_name=p_name,
                harga=int(p.get("harga", 0)),
                satuan=p.get("satuan", "item"),
                kategori=p.get("kategori", "umum")
            )

    # B. NODE CELAH MASALAH
    masalah_list = entities.get("celah_masalah", [])
    for m in masalah_list:
        isu = m.get("isu")
        if isu:
            session.run(
                """
                MATCH (a:Actor {id: $act_id})
                MERGE (cm:CelahMasalah {isu: $isu})
                SET cm.dampak = $dampak
                MERGE (a)-[:MENGHADAPI_KENDALA]->(cm)
                """,
                act_id=actor_id,
                isu=isu,
                dampak=m.get("dampak", "")
            )

    # C. NODE PROFESI SDM & ESTIMASI GAJI
    sdm_list = entities.get("profesi_sdm", [])
    for s in sdm_list:
        posisi = s.get("posisi")
        if posisi:
            session.run(
                """
                MATCH (a:Actor {id: $act_id})
                MERGE (pf:Profesi {posisi: $posisi})
                SET pf.gaji_estimasi = $gaji, pf.satuan = $satuan
                MERGE (a)-[r:MEMBUTUHKAN_SDM]->(pf)
                SET r.gaji_estimasi = $gaji
                """,
                act_id=actor_id,
                posisi=posisi,
                gaji=int(s.get("gaji_estimasi", 0)),
                satuan=s.get("satuan", "per bulan")
            )

    # D. MEMASOK & MEMBUTUHKAN (Rantai Pasok)
    query_memasok = """
    MATCH (a:Actor {id: $act_id}), (b:Actor)
    WHERE a.id <> b.id
      AND b.bahan_baku_dihasilkan IS NOT NULL
      AND any(x IN a.bahan_baku_dibutuhkan WHERE toLower(x) IN [y IN b.bahan_baku_dihasilkan | toLower(y)])
    MERGE (b)-[:MEMASOK]->(a)
    MERGE (a)-[:MEMBUTUHKAN]->(b)
    """
    session.run(query_memasok, act_id=actor_id)

    # E. BUTUH_KEAHLIAN & MEMILIKI_KEAHLIAN
    list_butuh = [x.lower() for x in entities.get("keahlian_dibutuhkan", [])]
    if list_butuh:
        query_butuh_keahlian = """
        MATCH (a:Actor {id: $act_id}), (k:Keahlian)
        WHERE toLower(k.nama) IN $list_butuh
        MERGE (a)-[:BUTUH_KEAHLIAN]->(k)
        """
        session.run(query_butuh_keahlian, act_id=actor_id, list_butuh=list_butuh)

    list_miliki = [x.lower() for x in entities.get("keahlian_dimiliki", [])]
    if list_miliki:
        query_memiliki_keahlian = """
        MATCH (a:Actor {id: $act_id}), (k:Keahlian)
        WHERE toLower(k.nama) IN $list_miliki
        MERGE (a)-[:MEMILIKI_KEAHLIAN]->(k)
        """
        session.run(query_memiliki_keahlian, act_id=actor_id, list_miliki=list_miliki)

    # F. TARGET_PASAR
    list_pasar = [x.lower() for x in entities.get("target_pasar", [])]
    if list_pasar:
        query_target_pasar = """
        MATCH (a:Actor {id: $act_id}), (t:TargetMarket)
        WHERE toLower(t.detail) IN $list_pasar
        MERGE (a)-[:TARGET_PASAR]->(t)
        """
        session.run(query_target_pasar, act_id=actor_id, list_pasar=list_pasar)



# ---------------------------------------------------------------
# SIMPAN / UPDATE AKTOR
# ---------------------------------------------------------------
@app.route("/api/actor/save", methods=["POST"])
def save_actor():
    data       = request.get_json()
    actor_id   = data.get("id", str(uuid.uuid4()))

    # Check permission
    user = session.get("user", "")
    is_admin = user.endswith(':admin') or user.endswith(':admin@2211080.com')

    existing_created_by = None
    actor_exists = False
    with driver.session() as check_session:
        res = check_session.run("MATCH (a:Actor {id: $act_id}) RETURN a.raw_data AS raw_data", act_id=actor_id).single()
        if res:
            actor_exists = True
            if res["raw_data"]:
                try:
                    rd = json.loads(res["raw_data"])
                    existing_created_by = rd.get("createdBy")
                except Exception:
                    pass

    if not is_admin:
        from config import db
        perm = db['permission_requests'].find_one({"nama_akun": user, "actor_id": actor_id, "status": "approved"})
        if actor_exists:
            is_owner = (existing_created_by == user) if existing_created_by else False
            if not is_owner and not perm:
                return jsonify({"success": False, "error": "Unauthorized"}), 403

    if not existing_created_by:
        data["createdBy"] = data.get("createdBy") or user
        data["isUserCreated"] = True
    else:
        data["createdBy"] = existing_created_by
        data["isUserCreated"] = True

    actor_type = data.get("type", "unknown")
    name       = data.get("name", "")
    lat        = data.get("lat")
    lng        = data.get("lng")

    # Perbaiki lat/lng dari rawCoords jika bernilai 0 atau tidak valid (untuk poligon)
    if (not lat or not lng or lat == 0.0 or lng == 0.0) and "rawCoords" in data:
        coords = data["rawCoords"]
        if coords:
            lat = sum(float(c.get("lat", 0)) for c in coords) / len(coords)
            lng = sum(float(c.get("lng", 0)) for c in coords) / len(coords)

    # Filter field yang tidak relevan untuk teks
    exclude_keys = {
        "lat", "lng", "foto", "Foto Visual Path", "color", "warna", "Warna",
        "Titik Koordinat (Lat, Lon)", "icon", "id", "type", "timestamp", "Marker Type",
        "promotion_page_data"  # Exclude raw layout JSON from embedding calculation
    }
    
    # Extract promotion page text if present
    promotion_page_text = data.get("promotion_page_text", "")
    if not promotion_page_text and "promotion_page_data" in data:
        try:
            lp_json = json.loads(data["promotion_page_data"])
            lp_elements = lp_json.get("elements", [])
            clean_texts = []
            for el in lp_elements:
                if el.get("type") in ["title", "text"]:
                    val = str(el.get("content", "")).strip()
                    if val:
                        clean_texts.append(val)
            promotion_page_text = "\n\n".join(clean_texts)
        except Exception:
            pass
    if promotion_page_text:
        data["promotion_page_text"] = promotion_page_text

    text_content = {k: v for k, v in data.items()
                    if k not in exclude_keys and not isinstance(v, list)}
    text_content.update({k: v for k, v in data.items()
                          if k not in exclude_keys and isinstance(v, list)})

    str_representation  = json.dumps(text_content, ensure_ascii=False)
    full_data_repr      = json.dumps(data, ensure_ascii=False)

    # Buat embedding (semantic search)
    try:
        embedding = get_embedding(str_representation)
    except Exception as e:
        print(f"[routes_actors] Embedding failed: {e}")
        embedding = None

    # Extract Fokus Usaha and Marker Type for relationships
    fokus_usaha = (data.get("Fokus Usaha") or "").strip()
    marker_type = data.get("Marker Type", "").strip()

    # Simpan ke Neo4j (MERGE = insert or update)
    query_save = """
    MERGE (a:Actor {id: $act_id})
    SET a.type              = $act_type,
        a.name              = $name,
        a.lat               = $lat,
        a.lng               = $lng,
        a.raw_data          = $raw_data,
        a.embedding         = $embedding,
        a.promotion_page_text = $promotion_page_text,
        a.fokus_usaha       = $fokus_usaha,
        a.marker_type       = $marker_type
    """

    with driver.session() as neo_session:
        # 1. Simpan/Update Node
        neo_session.run(
            query_save,
            act_id=actor_id, act_type=actor_type, name=name,
            lat=lat, lng=lng, raw_data=full_data_repr, embedding=embedding,
            promotion_page_text=promotion_page_text, fokus_usaha=fokus_usaha, marker_type=marker_type
        )
        # 2. Update all relationships
        update_actor_relations(neo_session, actor_id)

    return jsonify({"success": True, "id": actor_id})


# ---------------------------------------------------------------
# AMBIL SEMUA AKTOR
# ---------------------------------------------------------------
@app.route("/api/actors", methods=["GET"])
def get_actors():
    query = """
    MATCH (a:Actor)
    RETURN a.id AS id, a.type AS type, a.name AS name,
           a.lat AS lat, a.lng AS lng, a.raw_data AS raw_data
    """
    actors = []
    try:
        with driver.session() as neo_session:
            for record in neo_session.run(query):
                raw = {}
                if record["raw_data"]:
                    try:
                        raw = json.loads(record["raw_data"])
                    except Exception:
                        pass
                actors.append({
                    "id":       record["id"],
                    "type":     record["type"],
                    "name":     record["name"],
                    "lat":      record["lat"],
                    "lng":      record["lng"],
                    "raw_data": raw,
                })
        return jsonify({"actors": actors})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------
# HAPUS AKTOR
# ---------------------------------------------------------------
@app.route("/api/actor/delete", methods=["POST"])
def delete_actor():
    actor_id = request.get_json().get("id")
    user = session.get("user", "")
    is_admin = user.endswith(':admin') or user.endswith(':admin@2211080.com')
    if not is_admin:
        with driver.session() as neo_session:
            res = neo_session.run("MATCH (a:Actor {id: $act_id}) RETURN a.raw_data AS raw_data", act_id=actor_id).single()
            if res and res["raw_data"]:
                try:
                    rd = json.loads(res["raw_data"])
                    if rd.get("createdBy") and rd.get("createdBy") != user:
                        return jsonify({"success": False, "error": "Unauthorized"}), 403
                except Exception:
                    pass
    query    = "MATCH (a:Actor {id: $act_id}) DETACH DELETE a"
    with driver.session() as neo_session:
        neo_session.run(query, act_id=actor_id)
    return jsonify({"success": True})


# ---------------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    from config import MODEL_NAME, BASE_URL
    return jsonify({"status": "ok", "model": MODEL_NAME, "base_url": BASE_URL})



# ---------------------------------------------------------------
# PROMOTION PAGE BUILDER & VIEWER ROUTES
# ---------------------------------------------------------------
@app.route("/promotion_page_builder.html")
def promotion_page_builder_html_redirect():
    return redirect(url_for("promotion_page_builder", **request.args), code=301)


@app.route("/promotion_page_builder")
def promotion_page_builder():
    actor_id = request.args.get("actor_id")
    if not actor_id:
        return "Actor ID is required", 400

    query = """
    MATCH (a:Actor {id: $act_id})
    RETURN a.name AS name, a.raw_data AS raw_data
    """
    with driver.session() as neo_session:
        result = neo_session.run(query, act_id=actor_id).single()
        if not result:
            return "Actor not found", 404
        
        name = result["name"]
        raw_data_str = result["raw_data"]
        raw_data = {}
        if raw_data_str:
            try:
                raw_data = json.loads(raw_data_str)
            except Exception:
                pass
                
        # Dapatkan data promotion page (default "[]")
        promotion_page_data = raw_data.get("promotion_page_data", "[]")
        foto_visual = raw_data.get("Foto Visual Path") or raw_data.get("foto") or ""

    # Cek apakah user saat ini adalah admin atau pemilik/pembuat aktor
    user = session.get("user", "")
    is_admin = user.endswith(':admin') or user.endswith(':admin@2211080.com')
    if not is_admin and user:
        is_user_created = (raw_data.get("createdBy") == user)
        from config import db
        perm = db['permission_requests'].find_one({"nama_akun": user, "actor_id": actor_id, "status": "approved"})
        if perm or is_user_created:
            is_admin = True

    return render_template(
        "promotion_page_builder.html",
        unique_id=actor_id,
        name=name,
        promotion_page_data=promotion_page_data,
        foto_visual=foto_visual,
        is_admin=is_admin
    )


@app.route("/api/actor/<actor_id>/promotion/save", methods=["POST"])
def save_promotion_page(actor_id):
    # Check permission
    user = session.get("user", "")
    is_admin = user.endswith(':admin') or user.endswith(':admin@2211080.com')
    if not is_admin:
        is_user_created = False
        with driver.session() as neo_session:
            res = neo_session.run("MATCH (a:Actor {id: $act_id}) RETURN a.raw_data AS raw_data", act_id=actor_id).single()
            if res and res["raw_data"]:
                try:
                    rd = json.loads(res["raw_data"])
                    if rd.get("createdBy") == user:
                        is_user_created = True
                except Exception:
                    pass
        from config import db
        perm = db['permission_requests'].find_one({"nama_akun": user, "actor_id": actor_id, "status": "approved"})
        if not perm and not is_user_created:
            return jsonify({"success": False, "error": "Unauthorized"}), 403

    data = request.get_json()
    promotion_page_data = data.get("promotion_page_data", "[]")

    # Ekstrak data teks paragraf dan judul secara bersih
    clean_texts = []
    try:
        lp_json = json.loads(promotion_page_data)
        lp_elements = lp_json.get("elements", [])
        for el in lp_elements:
            if el.get("type") in ["title", "text"]:
                val = str(el.get("content", "")).strip()
                if val:
                    clean_texts.append(val)
    except Exception as e:
        print(f"[routes_actors] Error parsing promotion_page_data elements: {e}")
    
    promotion_page_text = "\n\n".join(clean_texts)

    get_query = "MATCH (a:Actor {id: $act_id}) RETURN a.raw_data AS raw_data"
    with driver.session() as neo_session:
        result = neo_session.run(get_query, act_id=actor_id).single()
        if not result:
            return jsonify({"success": False, "error": "Actor not found"}), 404
        
        raw_data_str = result["raw_data"]
        raw_data = {}
        if raw_data_str:
            try:
                raw_data = json.loads(raw_data_str)
            except Exception:
                pass
        
        # Simpan promotion page data dan text ke dalam raw_data
        raw_data["promotion_page_data"] = promotion_page_data
        raw_data["promotion_page_text"] = promotion_page_text
        
        # Hitung ulang embedding untuk aktor secara bersih
        exclude_keys = {
            "lat", "lng", "foto", "Foto Visual Path", "color", "warna", "Warna",
            "Titik Koordinat (Lat, Lon)", "icon", "id", "type", "timestamp", "Marker Type",
            "promotion_page_data"  # Exclude raw layout JSON from embedding calculation
        }
        text_content = {k: v for k, v in raw_data.items()
                        if k not in exclude_keys and not isinstance(v, list)}
        text_content.update({k: v for k, v in raw_data.items()
                              if k not in exclude_keys and isinstance(v, list)})
        
        str_representation = json.dumps(text_content, ensure_ascii=False)
        try:
            embedding = get_embedding(str_representation)
        except Exception as e:
            print(f"[routes_actors] Embedding failed in save_promotion_page: {e}")
            embedding = None

        updated_raw_data_str = json.dumps(raw_data, ensure_ascii=False)

        update_query = """
        MATCH (a:Actor {id: $act_id})
        SET a.raw_data = $raw_data,
            a.promotion_page_text = $promotion_page_text,
            a.embedding = $embedding
        """
        neo_session.run(
            update_query,
            act_id=actor_id,
            raw_data=updated_raw_data_str,
            promotion_page_text=promotion_page_text,
            embedding=embedding
        )
        
        # Update relationships because promotion_page_text and raw_data changed
        update_actor_relations(neo_session, actor_id)

    return jsonify({"success": True})


# ---------------------------------------------------------------
# AI BACKGROUND REMOVAL (rembg)
# ---------------------------------------------------------------
@app.route("/api/ai/remove_bg", methods=["POST"])
def remove_bg():
    import io
    import base64
    try:
        import rembg
        from PIL import Image
    except ImportError:
        return jsonify({"success": False, "error": "Library rembg/pillow belum terinstall di server."}), 500

    data = request.get_json() or {}
    image_data_url = data.get("image")
    if not image_data_url:
        return jsonify({"success": False, "error": "Data gambar tidak ditemukan."}), 400

    try:
        if image_data_url.startswith("data:image"):
            # Format: data:image/png;base64,...
            header, encoded = image_data_url.split(",", 1)
            img_bytes = base64.b64decode(encoded)
            img = Image.open(io.BytesIO(img_bytes))
        else:
            import requests
            resp = requests.get(image_data_url, timeout=15)
            img = Image.open(io.BytesIO(resp.content))

        if img.mode != "RGBA":
            img = img.convert("RGBA")

        # Process background removal
        output_img = rembg.remove(img)

        # Convert back to Base64
        buffered = io.BytesIO()
        output_img.save(buffered, format="PNG")
        output_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return jsonify({
            "success": True,
            "image": f"data:image/png;base64,{output_base64}"
        })
    except Exception as e:
        print(f"[remove_bg] Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


# ---------------------------------------------------------------
# AI PROMO TEXT GENERATOR
# ---------------------------------------------------------------
@app.route("/api/ai/copywriter_assist", methods=["POST"])
def copywriter_assist():
    from ai_engine import call_llm
    data = request.get_json() or {}
    user_prompt = data.get("prompt", "").strip()
    refine_target = data.get("refine_target", "").strip()
    element_type = data.get("type", "text")
    current_content = data.get("current_content", "").strip()

    if not user_prompt and not refine_target:
        return jsonify({"success": False, "error": "Silakan masukkan data usaha atau pilih teks untuk di-generate ulang."}), 400

    system_prompt = (
        "Anda adalah AI Promo Text Generator Khusus Riset Digitalisasi Usaha Mikro dan Lokal Tradisional.\n"
        "Tugas Anda: Mengubah data mentah/sederhana hasil riset lapangan (misal: warung sayur, toko kelontong, kuliner rumahan, jasa servis) "
        "menjadi teks promosi landing page yang jujur, bersahabat, terpercaya, dan membumi.\n\n"
        "ATURAN KETAT (ANTI-OVERCLAIM & ANTI-ALAY):\n"
        "1. DILARANG menggunakan kata-kata clickbait/hiperbola berlebihan (misal: 'Revolusi Terbesar', 'Sensasi Menggemparkan', 'No 1 di Dunia', 'Diskon Spektakuler').\n"
        "2. DILARANG mengarang fakta, sertifikasi, diskon, atau khasiat medis palsu yang tidak ada di data input.\n"
        "3. Gunakan bahasa Indonesia yang santun, ramah, bersahabat, dan dekat dengan warga sekitar/tetangga.\n"
        "4. Fokuskan pada fakta riil: kesegaran/kualitas asli produk, kejelasan harga, jam buka, dan kemudahan kontak WhatsApp/pesan antar.\n"
        "5. Susun hasil secara terstruktur dalam Markdown rapi dengan judul dan poin-poin yang mudah dibaca."
    )

    if refine_target:
        full_prompt = (
            f"TEKS ASLI YANG HARUS DI-GENERATE ULANG:\n\"{refine_target}\"\n\n"
            f"Instruksi / Catatan Pengguna: {user_prompt or 'Buatkan kalimat pengganti yang lebih tepat, tetap ramah, menarik, dan tidak overclaim.'}\n\n"
            "PENTING:\n"
            "Tuliskan HANYA teks revisi pengganti terbaik untuk teks target di atas. DILARANG menambahkan kata pembuka, penutup, nomor opsi, atau tanda kutip di luar teks."
        )
    else:
        full_prompt = (
            f"Data Usaha / Catatan Lapangan:\n{user_prompt}\n\n"
            f"Jenis Elemen Canvas: {element_type}\n"
            f"Teks Saat Ini di Canvas: {current_content or '(kosong)'}\n\n"
            "Tolong buatkan teks promosi landing page yang hangat, jelas, dan membumi sesuai aturan di atas."
        )

    try:
        response_text = call_llm(system_prompt, full_prompt)
        return jsonify({"success": True, "response": response_text})
    except Exception as e:
        print(f"[copywriter_assist] Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


# ---------------------------------------------------------------
# UI KIT BLOCK TEMPLATES API
# ---------------------------------------------------------------
@app.route("/api/uikit/templates", methods=["GET"])
def get_uikit_templates():
    """Mengambil daftar semua template blok UI Kit yang telah dipublish."""
    from config import db
    try:
        col = db['uikit_templates']
        templates = list(col.find({}, {"_id": 0}).sort("created_at", -1))
        return jsonify({"success": True, "templates": templates})
    except Exception as e:
        print(f"[get_uikit_templates] Error: {e}")
        return jsonify({"success": False, "error": str(e), "templates": []})


@app.route("/api/uikit/template/save", methods=["POST"])
def save_uikit_template():
    """Menyimpan atau memperbarui template blok UI Kit ke database."""
    from config import db
    from datetime import datetime
    try:
        data = request.get_json() or {}
        template_id = data.get("id") or str(uuid.uuid4())
        name = data.get("name", "Template Baru")
        tag = data.get("tag", "Umum")
        thumbnail = data.get("thumbnail", "")
        elements_data = data.get("elements", [])
        
        doc = {
            "id": template_id,
            "name": name,
            "tag": tag,
            "thumbnail": thumbnail,
            "elements": elements_data,
            "created_at": datetime.now().isoformat(),
            "created_by": session.get("user", "")
        }
        
        col = db['uikit_templates']
        col.update_one({"id": template_id}, {"$set": doc}, upsert=True)
        return jsonify({"success": True, "template": doc})
    except Exception as e:
        print(f"[save_uikit_template] Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/uikit/template/delete", methods=["POST"])
def delete_uikit_template():
    """Menghapus template blok UI Kit berdasarkan ID."""
    from config import db
    try:
        data = request.get_json() or {}
        template_id = data.get("id")
        if not template_id:
            return jsonify({"success": False, "error": "Template ID wajib disertakan"}), 400
        col = db['uikit_templates']
        col.delete_one({"id": template_id})
        return jsonify({"success": True})
    except Exception as e:
        print(f"[delete_uikit_template] Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/uikit/tag/delete", methods=["POST"])
def delete_uikit_tag():
    """Menghapus atau mengalihkan tag kategori UI Kit."""
    from config import db
    try:
        data = request.get_json() or {}
        tag_name = data.get("tag", "").strip()
        if not tag_name or tag_name.lower() == "semua":
            return jsonify({"success": False, "error": "Tag tidak valid untuk dihapus"}), 400
        
        col = db['uikit_templates']
        # Alihkan template dengan tag ini ke 'Umum'
        col.update_many({"tag": tag_name}, {"$set": {"tag": "Umum"}})
        return jsonify({"success": True})
    except Exception as e:
        print(f"[delete_uikit_tag] Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500





