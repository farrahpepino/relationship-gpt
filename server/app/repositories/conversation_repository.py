from sqlalchemy.orm import Session
from app.models.conversation import Conversation
from uuid import uuid4

class Conversation_Repository:
    
    def create(self, db:Session, user_id):
        conversation = Conversation(
            id=str(uuid4()),
            user_id=user_id,
            title="New conversation"
        )
        
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation
    
    def get_conversation(self, db:Session, conversation_id):
        return db.query(Conversation).filter_by(id=conversation_id).first()

    def get_conversations(self, db: Session, user_id):
        return db.query(Conversation).filter(Conversation.user_id==user_id) \
        .order_by(Conversation.last_opened.desc()) \
        .all()
    
    def update_title(self, db: Session, conversation_id: str, title: str):
        conversation = self.get_conversation(db, conversation_id)
        if not conversation:
            return None

        conversation.title = title
        db.commit()
        db.refresh(conversation)
        
        return conversation
        