"""
Mode 1 Cipta Kerja: Skill & Sumber Daya
Mekanisme Dual-Jalur: Penempatan Kerja (Matching Existing) & Wirausaha Baru (Micro)
Visualisasi Komponen: Card Profil Sumber Daya, Card Penempatan Kerja, & Card Rintisan Usaha
"""

def get_sumber_daya_instruction():
    return (
        "FOKUS ANALISIS MODE 1 (Profil Sumber Daya, Skill, Aset, Produk & Matching Kerja):\n"
        "Identifikasi masukan user terkait KEAHLIAN/SKILL, MODAL, ALAT/ASET, PRODUK, atau WAKTU LUANG yang dimiliki.\n\n"
        "FORMAT VISUALISASI JAWABAN (Gunakan Komponen Visual Structured Markdown):\n"
        "### PROFIL SUMBER DAYA USER\n"
        "- **Skill & Keahlian Utama**: [Daftar skill yang terdeteksi]\n"
        "- **Aset/Modal/Alat**: [Daftar aset atau modal awal]\n\n"
        "### JALUR A: PENEMPATAN KERJA (Tanpa Modal / Matching Usaha Existing)\n"
        "- Identifikasi aktor/usaha di radius Neo4j yang terdeteksi.\n"
        "- Berikan rekomendasi konkret nama aktor lokal (WAJIB Tag AEO [[Nama|ID]]) dan posisi kerja yang bisa dimasuki tanpa modal.\n\n"
        "### JALUR B: WIRAUSAHA BARU (Rintisan Mandiri Berbasis Aset/Skill)\n"
        "- Rekomendasi 1-2 ide bisnis mikro berbasis produk/skill yang dimiliki.\n"
        "- Gunakan format **Tabel Markdown** untuk merinci komponen bisnis (Nama Ide, Bahan Baku, Target Pasar Lokal, Potensi Hasil).\n"
        "- Hubungkan dengan calon pemasok/pasar di radius ini.\n\n"
        "Catatan: Langkah selanjutnya: Pilih Mode 2 (Celah Masalah) untuk validasi pasar atau Mode 4 (Simulasi Modal) untuk hitung keuangan."
    )


