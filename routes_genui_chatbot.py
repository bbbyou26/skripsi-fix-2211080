"""
routes_genui_chatbot.py — Module khusus untuk GenUI Chatbot RAG (Pinecone Vector Store)
"""
from flask import request, jsonify
from config import app, db, pinecone_index
from ai_engine import call_llm, get_embedding
import os
import json
import time
import io
import re

def clean_chatbot_response(text: str) -> str:
    """Membersihkan simbol markdown seperti ***, **, *, __, `#`, dll menggunakan Regex."""
    if not text:
        return ""
    # 1. Hapus simbol asterisk bold/italic (***, **, *)
    cleaned = re.sub(r'\*{1,3}', '', text)
    # 2. Hapus simbol underscore bold/italic (___, __, _)
    cleaned = re.sub(r'_{1,3}', '', cleaned)
    # 3. Hapus simbol markdown header (#, ##, ### di awal baris)
    cleaned = re.sub(r'^#{1,6}\s*', '', cleaned, flags=re.MULTILINE)
    # 4. Hapus backticks (``` atau `)
    cleaned = re.sub(r'`{1,3}', '', cleaned)
    # 5. Trim spasi per baris
    lines = [line.strip() for line in cleaned.splitlines()]
    return "\n".join(lines).strip()

def extract_text_from_file(file_storage, file_ext: str) -> str:
    """Ekstrak konten teks dari file stream (PDF, TXT, DOCX, JSON, MD, CSV)."""
    try:
        content = file_storage.read()
        file_storage.seek(0) # Reset pointer
        
        if file_ext in ['.txt', '.md', '.json', '.csv']:
            return content.decode('utf-8', errors='ignore')
        elif file_ext == '.pdf':
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content))
            extracted = [page.extract_text() or '' for page in reader.pages]
            return "\n".join(extracted)
        elif file_ext == '.docx':
            import docx
            doc = docx.Document(io.BytesIO(content))
            return "\n".join([p.text for p in doc.paragraphs if p.text])
        return ""
    except Exception as e:
        print(f"[routes_genui_chatbot] Text extraction error: {e}")
        return ""


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> list:
    """Potong teks panjang menjadi beberapa chunk paragraf dengan overlap."""
    if not text:
        return []
    paragraphs = text.split('\n')
    chunks = []
    current_chunk = ""
    
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        if len(current_chunk) + len(p) <= chunk_size:
            current_chunk += p + "\n"
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = p + "\n"
    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks


@app.route('/api/chatbot/upload_doc', methods=['POST'])
def upload_rag_document():
    """Endpoint untuk mengunggah dokumen sumber RAG ke Pinecone Vector Database (100% Cloud)."""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'Tidak ada file yang diunggah.'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'Nama file kosong.'}), 400

        actor_id = request.form.get('actor_id', 'general')
        file_ext = os.path.splitext(file.filename)[1].lower()
        allowed_exts = ['.pdf', '.txt', '.docx', '.json', '.md', '.csv']
        if file_ext not in allowed_exts:
            return jsonify({'success': False, 'message': f'Format file {file_ext} tidak didukung. Gunakan PDF/TXT/DOCX/JSON/CSV/MD.'}), 400

        if not pinecone_index:
            return jsonify({'success': False, 'message': 'Pinecone Index belum terinisialisasi. Cek API Key.'}), 500

        # 1. Ekstrak teks dari file
        raw_text = extract_text_from_file(file, file_ext)
        if not raw_text.strip():
            return jsonify({'success': False, 'message': f'Tidak dapat membaca teks dari file {file.filename}.'}), 400

        # 2. Chunking teks
        chunks = chunk_text(raw_text)
        if not chunks:
            return jsonify({'success': False, 'message': 'File kosong atau tidak memiliki konten teks.'}), 400

        # 3. Generate Embedding & Upsert ke Pinecone
        vectors_to_upsert = []
        timestamp = time.time_ns()
        for idx, chunk in enumerate(chunks):
            embedding = get_embedding(chunk)
            if embedding:
                vec_id = f"rag_{actor_id}_{timestamp}_{idx}"
                vectors_to_upsert.append({
                    "id": vec_id,
                    "values": embedding,
                    "metadata": {
                        "text": chunk,
                        "filename": file.filename,
                        "actor_id": actor_id
                    }
                })

        if not vectors_to_upsert:
            return jsonify({'success': False, 'message': 'Gagal menghasilkan embedding untuk dokumen.'}), 500

        # Upsert batch ke Pinecone
        pinecone_index.upsert(vectors=vectors_to_upsert)

        return jsonify({
            'success': True,
            'message': f'Dokumen "{file.filename}" berhasil diproses dan {len(vectors_to_upsert)} vector chunk telah tersimpan di Pinecone Vector DB.',
            'filename': file.filename,
            'chunks_count': len(vectors_to_upsert)
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'Gagal mengunggah dokumen RAG ke Pinecone: {str(e)}'}), 500


@app.route('/api/chatbot/query', methods=['POST'])
def query_genui_chatbot():
    """Endpoint interaktif tanya-jawab GenUI Chatbot berbasis Pinecone Vector RAG."""
    try:
        data = request.json or {}
        user_query = data.get('query', '')
        actor_id = data.get('actor_id', '')
        config_data = data.get('config', {})

        if not user_query:
            return jsonify({'success': False, 'message': 'Pertanyaan tidak boleh kosong.'}), 400

        # 1. Ambil konteks RAG dari Pinecone Vector Store
        pinecone_rag_context = ""
        if pinecone_index:
            try:
                query_vector = get_embedding(user_query)
                if query_vector:
                    eff_actor = actor_id if actor_id else "general"
                    # Pencarian Utama: Filter spesifik aktor ini + general
                    search_filter = {"actor_id": {"$in": [eff_actor, "general"]}}
                    pinecone_res = pinecone_index.query(
                        vector=query_vector,
                        top_k=6,
                        include_metadata=True,
                        filter=search_filter
                    )
                    matches = pinecone_res.get('matches', [])

                    # Fallback Pencarian Sekunder: Jika pencarian gabungan kosong, tetap cari dokumen spesifik milik aktor tersebut saja
                    if not matches and actor_id:
                        actor_only_filter = {"actor_id": actor_id}
                        pinecone_res = pinecone_index.query(
                            vector=query_vector,
                            top_k=6,
                            include_metadata=True,
                            filter=actor_only_filter
                        )
                        matches = pinecone_res.get('matches', [])

                    retrieved_texts = []
                    for match in matches:
                        meta = match.get('metadata', {})
                        if 'text' in meta:
                            retrieved_texts.append(f"[{meta.get('filename', 'Dokumen')}] {meta['text']}")
                    
                    if retrieved_texts:
                        pinecone_rag_context = "\n---\n".join(retrieved_texts)
            except Exception as pe:
                print(f"[routes_genui_chatbot] Pinecone search error: {pe}")

        # 2. Susun System Prompt & panggil Model AI (call_llm)
        bot_name = config_data.get('botName', 'AI Assistant')
        welcome_msg = config_data.get('welcomeMsg', '')
        tone = config_data.get('tone', 'friendly')
        custom_instructions = config_data.get('systemPrompt', '')

        system_prompt = f"""Anda adalah asisten AI interaktif bernama '{bot_name}' untuk halaman promosi usaha.
Gaya bahasa: {tone}.

INFORMASI DOKUMEN RAG (PINECONE VECTOR STORE - SANGAT PENTING & MUTLAK HARUS DIPAKAI SEBAGAI UTAMA):
{pinecone_rag_context if pinecone_rag_context else 'Tidak ada dokumen spesifik terlampir.'}

Instruksi Khusus Pemilik Usaha:
{custom_instructions if custom_instructions else 'Jawablah pertanyaan pengunjung dengan ramah, akurat, informatif, dan membantu.'}

PETUNJUK UTAMA:
Jika terdapat INFORMASI DOKUMEN RAG di atas, Anda WAJIB dan MUTLAK menjawab pertanyaan pengguna berdasarkan isi INFORMASI DOKUMEN RAG tersebut. Jangan pernah mengarang data atau mengabaikan isi dokumen RAG yang disediakan.
"""

        # 3. Panggil Model AI Utama dengan Temperature & Max Tokens dinamis dari Pengaturan Panel
        user_temp = float(config_data.get('temperature', 0.7))
        user_max_tokens = int(config_data.get('maxTokens', 1024))
        
        response_text = call_llm(
            system_prompt=system_prompt, 
            user_prompt=user_query, 
            temperature=user_temp,
            max_tokens=user_max_tokens
        )
        response_text = clean_chatbot_response(response_text)

        genui_card = None
        if config_data.get('enable_product_card', True) and any(w in user_query.lower() for w in ['harga', 'produk', 'layanan', 'beli']):
            genui_card = {
                'type': 'product_card',
                'title': 'Rekomendasi Produk/Layanan',
                'price': 'Hubungi Kami',
                'action_url': '#',
                'action_label': 'Lihat Detail'
            }

        return jsonify({
            'success': True,
            'answer': response_text,
            'genui_card': genui_card
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'Gagal memproses obrolan RAG: {str(e)}'}), 500

