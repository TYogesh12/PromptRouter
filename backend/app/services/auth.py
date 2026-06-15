from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import create_client, Client
from backend.app.config import SUPABASE_URL, SUPABASE_ANON_KEY
import uuid

# Initialize the official Supabase Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# This tells FastAPI to look for "Authorization: Bearer <token>" in the request header
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> uuid.UUID:
    token = credentials.credentials
    try:
        # Securely verifies the token against Supabase directly
        # This natively handles ES256, asymmetric certificates, and expiration flawlessly!
        response = supabase.auth.get_user(token)
        user_id = response.user.id
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        return uuid.UUID(user_id)
        
    except Exception as e:
        print(f"Supabase Auth Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
