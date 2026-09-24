"""
config.py — Inisialisasi Flask, Database, OpenAI & Neo4j
=========================================================
Semua konfigurasi global & koneksi diletakkan di sini agar
modul lain cukup melakukan: from config import app, db, driver, ...
"""
import os
from flask import Flask
from openai import OpenAI
from neo4j import GraphDatabase
from pymongo import MongoClient

# ===============================
# FLASK APP
# ===============================
import jinja2

app = Flask(__name__)
app.secret_key = "secret123"

# Multi-folder template loader (supports templates/ and web-app/)
_base_dir = os.path.dirname(os.path.abspath(__file__))
_template_dirs = [
    os.path.join(_base_dir, 'templates'),
    os.path.join(_base_dir, 'web-app'),
]
app.jinja_loader = jinja2.ChoiceLoader([
    jinja2.FileSystemLoader(d) for d in _template_dirs if os.path.exists(d)
])

UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ===============================
# MONGODB
# ===============================
_mongo_client = MongoClient(
    "mongodb+srv://naskahprasetyo_db_user:UAH3NfLD85D3rjCH@p1.r9jhs5z.mongodb.net/"
)
db = _mongo_client['mydatabase']

users_collection        = db['users']
permission_requests_collection = db['permission_requests']
creation_requests_collection   = db['creation_quota_requests']

# ===============================
# OPENAI / LLM
# ===============================
# OPENAI_API_KEY_LLM  = "sk-_OlgjbzxzOAiCi83dQ6jQQ"
# # OPENAI_API_KEY_LLM = "sk-nHv_PrfJ9Bu7ZiMfE07MmQ"
# OPENAI_API_KEY_EMBED = "sk-WzeaX3n53IrKai9xEo4pRA"
# BASE_URL    = "https://api.maiarouter.ai/v1"
OPENAI_API_KEY  = "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"
OPENAI_API_KEY_LLM = OPENAI_API_KEY
OPENAI_API_KEY_EMBED = OPENAI_API_KEY
BASE_URL    = "https://openrouter.ai/api/v1"
MODEL_NAME  = "openai/gpt-4.1-mini"
EMBED_MODEL = "openai/text-embedding-3-large"

client_llm = OpenAI(api_key=OPENAI_API_KEY_LLM,  base_url=BASE_URL)
client_embed = OpenAI(api_key=OPENAI_API_KEY_EMBED, base_url=BASE_URL)

# ===============================
# PINECONE VECTOR DB
# ===============================
PINECONE_API_KEY = "pcsk_m9TM5_4fXAEHLAoxhn2Xm4jUr8tRnLs8SKDHQ22m48He1Gvs8LNve7UETiLoE2CxH6Jnk"
PINECONE_INDEX_NAME = "genui-rag"

pinecone_index = None
try:
    from pinecone import Pinecone
    pc = Pinecone(api_key=PINECONE_API_KEY)
    pinecone_index = pc.Index(PINECONE_INDEX_NAME)
    print(f"[config] Pinecone Index '{PINECONE_INDEX_NAME}' initialized successfully.")
except Exception as e:
    print(f"[config] Warning: Pinecone initialization failed: {e}")


# ===============================
# NEO4J GRAPH DATABASE
# ===============================
NEO4J_URI      = "neo4j+s://ee656ba0.databases.neo4j.io"
NEO4J_USER     = "ee656ba0"
NEO4J_PASSWORD = "xAfWF16FqJbuDtlTR9hf5CnhZpbQxRgBGWfROfYghdI"

# NEO4J_URI      = "bolt://127.0.0.1:7687"
# NEO4J_USER     = "neo4j"
# NEO4J_PASSWORD = "26022002"

# NEO4J_URI      = "bolt://127.0.0.1:7687"
# NEO4J_USER     = "neo4j"
# NEO4J_PASSWORD = "12345678"
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# ===============================
# CORE LIBRARIES (REQUIRED)
# ===============================

HAS_GIS           = False
HAS_ADVANCED_TOOLS = False
