from sqlalchemy import Column, Integer, String, TIMESTAMP, func
from app.database.base import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(255), primary_key=True, unique=True)
    email = Column(String(255))
    name = Column(String(255))
    created_at = Column(TIMESTAMP, server_default=func.now()) 

