from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import initialize_database, get_tables, get_rules

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database on startup
    initialize_database()
    yield

app = FastAPI(
    title="Log-Based Cyber Attack Detection API",
    description="Backend API for the Log-Based Cyber Attack Detection and Alert System",
    version="1.0.0",
    lifespan=lifespan
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Log-Based Cyber Attack Detection API",
        "status": "running"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "cyber-attack-detection-api"
    }

@app.get("/api/db/health")
def db_health_check():
    tables = get_tables()
    return {
        "status": "healthy",
        "database": "sqlite",
        "tables": tables
    }

@app.get("/api/rules")
def read_rules():
    rules = get_rules()
    return rules
