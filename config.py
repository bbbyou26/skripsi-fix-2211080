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

from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

# ===============================
# FLASK APP
# ===============================
import jinja2

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "secret123")

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
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://naskahprasetyo_db_user:UAH3NfLD85D3rjCH@p1.r9jhs5z.mongodb.net/")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "mydatabase")

_mongo_client = MongoClient(MONGO_URI)
db = _mongo_client[MONGO_DB_NAME]

users_collection        = db['users']
permission_requests_collection = db['permission_requests']
creation_requests_collection   = db['creation_quota_requests']

# ===============================
# OPENAI / LLM
# ===============================
OPENAI_API_KEY      = os.getenv("OPENAI_API_KEY", "")
OPENAI_API_KEY_LLM  = os.getenv("OPENAI_API_KEY_LLM", OPENAI_API_KEY)
OPENAI_API_KEY_EMBED= os.getenv("OPENAI_API_KEY_EMBED", OPENAI_API_KEY)
BASE_URL            = os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1")
MODEL_NAME          = os.getenv("MODEL_NAME", "openai/gpt-4.1-mini")
EMBED_MODEL         = os.getenv("EMBED_MODEL", "openai/text-embedding-3-large")

client_llm = OpenAI(api_key=OPENAI_API_KEY_LLM,  base_url=BASE_URL)
client_embed = OpenAI(api_key=OPENAI_API_KEY_EMBED, base_url=BASE_URL)

# ===============================
# PINECONE VECTOR DB
# ===============================
PINECONE_API_KEY    = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "genui-rag")

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
NEO4J_URI      = os.getenv("NEO4J_URI", "neo4j+s://ee656ba0.databases.neo4j.io")
NEO4J_USER     = os.getenv("NEO4J_USER", "ee656ba0")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# ===============================
# CORE LIBRARIES (REQUIRED)
# ===============================

HAS_GIS           = False
HAS_ADVANCED_TOOLS = False
