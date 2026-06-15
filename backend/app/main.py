from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database.db import Base, engine
from backend.app.routes import prompt
from backend.app.config import ALLOWED_ORIGINS

Base.metadata.create_all(bind=engine)

app=FastAPI(title= "GenAI Prompt Router")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

app.include_router(prompt.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Prompt Routing API"}

