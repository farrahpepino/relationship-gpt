from pydantic import BaseModel

class User_Out(BaseModel):
    email: str
    name: str
    
    class Config:
        from_attributes = True
        
        
    
    
    