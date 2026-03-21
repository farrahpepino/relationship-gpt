from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers import auth, chat
from app.database.base import Base
from app.database.session import engine

from app.models import user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(chat.router)

Base.metadata.create_all(bind=engine)