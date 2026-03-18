from fastapi import FastAPI

from app.api import auth
from app.database.base import Base
from app.database.session import engine

from app.models import user

app = FastAPI()

app.include_router(auth.router)

Base.metadata.create_all(bind=engine)