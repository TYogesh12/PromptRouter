import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

SUPABASE_URL = os.getenv("SUPABASE_URL")

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

ML_MODEL = os.path.join(PROJECT_ROOT, "ml", "model", "prompt_classifier.pkl")

ML_VECTORIZER = os.path.join(PROJECT_ROOT, "ml", "model", "tfidf_vectorizer.pkl")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")


