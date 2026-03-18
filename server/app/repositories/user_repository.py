from sqlalchemy.orm import Session
from app.models.user import User

class User_Repository:
    
    def get_by_id(self, db:Session, id: str):
        return db.query(User).filter(User.id == id).first()
    
    def create_user(self, db:Session, id: str, email: str, name: str):
        user = User(
            id = id,
            email = email,
            name = name
        )
        
        db.add(user)
        db.commit() 
        db.refresh(user) # what for?
        return user
    