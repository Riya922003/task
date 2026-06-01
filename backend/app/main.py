import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import router
from app.database import Base, engine
from app.models import user, task  # ensure models are registered

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Primetrade.ai Task API",
    description="REST API with JWT authentication and role-based access control",
    version="1.0.0",
)

# ALLOWED_ORIGINS env var lets you add your Vercel URL without touching code
_extra = os.getenv("ALLOWED_ORIGINS", "")
_origins = [o.strip() for o in _extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        *_origins,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
