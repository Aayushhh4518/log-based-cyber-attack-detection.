from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from app.database import initialize_database, get_tables, get_rules, insert_log_events, get_log_events
from app.services.log_parser import parse_log_file

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database on startup (reload trigger)
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

@app.post("/api/logs/parse")
def parse_logs():
    base_dir = Path(__file__).resolve().parent.parent.parent
    log_path = base_dir / "sample_logs" / "security_sample.log"
    
    if not log_path.exists():
        return {"status": "error", "message": f"Log file not found at {log_path}"}
        
    events = parse_log_file(str(log_path))
    inserted = insert_log_events(events)
    
    return {
        "status": "success",
        "events_parsed": len(events),
        "events_inserted": inserted
    }

@app.get("/api/logs")
def read_logs(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=100)):
    events = get_log_events(page=page, page_size=page_size)
    return events
