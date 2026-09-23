from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from app.database import (
    initialize_database, get_tables, get_rules, insert_log_events, get_log_events,
    insert_alerts, get_alerts, get_alert_by_id, get_dashboard_stats
)
from app.services.log_parser import parse_log_file
from app.detectors.engine import run_all_detectors

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
    "*"
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
def read_logs(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=1000)):
    events = get_log_events(page=page, page_size=page_size)
    return events

@app.post("/api/analyze")
def analyze_logs():
    events = get_log_events(page=1, page_size=1000)
    alerts = run_all_detectors(events)
    inserted = insert_alerts(alerts)
    
    breakdown = {
        "brute_force": sum(1 for a in alerts if a['detection_type'] == 'Potential Brute-Force Attack'),
        "privilege_escalation": sum(1 for a in alerts if a['detection_type'] == 'Suspicious Privilege Escalation'),
        "login_anomaly": sum(1 for a in alerts if a['detection_type'] == 'Anomalous Login Time')
    }
    
    return {
        "status": "success",
        "events_analyzed": len(events),
        "alerts_generated": len(inserted),
        "breakdown": breakdown
    }

@app.get("/api/alerts")
def read_alerts(
    severity: str = Query("All"),
    detection_type: str = Query("All"),
    status: str = Query("All"),
    search: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=1000)
):
    return get_alerts(severity, detection_type, status, search, page, page_size)

@app.get("/api/alerts/{alert_id}")
def read_alert_details(alert_id: int):
    from fastapi import HTTPException
    alert = get_alert_by_id(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@app.get("/api/stats")
def read_stats():
    return get_dashboard_stats()

from app.services.simulator import execute_scenario
from app.database import clear_demo_data
from pydantic import BaseModel

class DemoEventRequest(BaseModel):
    scenario: str

@app.post("/api/demo/normal-login")
def demo_normal_login():
    return execute_scenario("normal-login")

@app.post("/api/demo/failed-login")
def demo_failed_login():
    return execute_scenario("failed-login")

@app.post("/api/demo/brute-force")
def demo_brute_force():
    return execute_scenario("brute-force")

@app.post("/api/demo/privilege-escalation")
def demo_privilege_escalation():
    return execute_scenario("privilege-escalation")

@app.post("/api/demo/anomalous-login")
def demo_anomalous_login():
    return execute_scenario("anomalous-login")

@app.post("/api/demo/clear")
def demo_clear_data():
    res = clear_demo_data(clear_all=False)
    stats = get_dashboard_stats()
    return {
        "status": "success",
        "message": "Demonstration security events and alerts cleared.",
        "details": res,
        "stats": stats
    }

@app.post("/api/demo/events")
def demo_generic_event(req: DemoEventRequest):
    return execute_scenario(req.scenario)

@app.post("/api/reset")
def reset_database():
    res = clear_demo_data(clear_all=True)
    return {"status": "success", "message": "Database reset to initial clean state", "details": res}
