from sqlalchemy.orm import Session
from app.models.message import Message

class Message_Repository:
    
    def create(self, db:Session, message):
        db.add(message)
        db.commit()
        db.refresh(message)
        return message
    
    def get_messages(self, db:Session, conversation_id):
        return db.query(Message).filter_by(conversation_id=conversation_id) \
        .order_by(Message.created_at.asc()).all()
        
    def delete_messages(self, db: Session, conversation_id):
        db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).delete()
        db.commit()