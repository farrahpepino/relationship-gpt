from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.chat_service import Chat_Service
from app.services.auth_service import Auth_Service
from app.models import *
from app.dtos.message import *

router = APIRouter()
chat_service = Chat_Service()
auth_service = Auth_Service()

def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    token = authorization.split(" ")[1]
    print(token)
    return auth_service.authenticate_account(db, token)

@router.post("/create-conversation")
def create_conversation(db: Session = Depends(get_db), user = Depends(get_current_user) ):
    return chat_service.create_conversation(db, user.id)

@router.post("/{conversation_id}/send-message")
def send_message(conversation_id: str, body: Message_Request, db: Session = Depends(get_db),user = Depends(get_current_user) ):
    return chat_service.send_message(db, user.id, conversation_id, body.input)

@router.get("/{conversation_id}/messages")
def get_messages(conversation_id: str, db: Session = Depends(get_db)):
    return chat_service.get_messages(db, conversation_id)

@router.get("/conversations")
def get_conversations(db: Session = Depends(get_db), user = Depends(get_current_user) ):
    return chat_service.get_conversations(db, user.id)

@router.get("/{conversation_id}")
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    return chat_service.get_conversation(db, conversation_id)