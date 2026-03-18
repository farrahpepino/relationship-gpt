from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import HTTPException
import os

from app.repositories.user_repository import User_Repository

class Auth_Service:
    
    def __init__(self):
        self.repository = User_Repository()
        
    def authenticate_account(self, db, token: str):
        try: 
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                os.getenv("GOOGLE_CLIENT_ID")
            )
            
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        id = idinfo["sub"]
        email = idinfo["email"]
        name = idinfo.get("name", "")
        
        user = self.repository.get_by_id(db, id)
        
        if not user:
            user = self.repository.create_user(db, id, email, name)
            
        return user