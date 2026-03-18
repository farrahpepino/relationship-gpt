from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.services.auth_service import Auth_Service
from app.schemas.user import User_Out
from app.database.session import get_db

router = APIRouter()
auth_service = Auth_Service()

@router.post("/auth/google", response_model=User_Out)
def google_auth(token: str, db: Session = Depends(get_db)):
    user = auth_service.authenticate_account(db, token)
    return user