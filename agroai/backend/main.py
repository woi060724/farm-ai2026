"""
AgroAI Backend — FastAPI Application
=====================================
Жылыжай шаруашылығы үшін ЖИ мал есебі жүйесі
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from models.database import create_tables
from routers import auth, livestock, ai_detection, chat, health, reports, farms


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create DB tables
    await create_tables()
    yield
    # Shutdown cleanup (if needed)


app = FastAPI(
    title="AgroAI API",
    description="Жылыжай шаруашылығы үшін ЖИ мал есебі веб-жүйесінің REST API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router,         prefix="/api/v1/auth",      tags=["Auth"])
app.include_router(livestock.router,    prefix="/api/v1/livestock",  tags=["Livestock"])
app.include_router(farms.router,        prefix="/api/v1/farms",      tags=["Farms"])
app.include_router(ai_detection.router, prefix="/api/v1/ai",         tags=["AI Detection"])
app.include_router(chat.router,         prefix="/api/v1/chat",       tags=["AI Chatbot"])
app.include_router(health.router,       prefix="/api/v1/health",     tags=["Health Records"])
app.include_router(reports.router,      prefix="/api/v1/reports",    tags=["Reports"])


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "AgroAI API v1.0",
        "docs": "/docs",
        "status": "online",
    }


@app.get("/api/v1/health-check", tags=["Root"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
