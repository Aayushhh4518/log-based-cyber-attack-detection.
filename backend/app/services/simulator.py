from datetime import datetime, timezone, timedelta
from app.database import (
    insert_log_events, insert_alerts, get_dashboard_stats,
    get_log_events, clear_demo_data
)
from app.detectors.engine import run_all_detectors

def get_demo_timestamp(hour: int, minute: int, second: int = 0) -> str:
    """Returns a deterministic UTC ISO timestamp using today's date with the specified time."""
    now = datetime.now(timezone.utc)
    target = now.replace(hour=hour, minute=minute, second=second, microsecond=0)
    return target.strftime("%Y-%m-%dT%H:%M:%SZ")

def generate_normal_login_events() -> list:
    """Scenario 1: One successful authentication event during normal window (10:15 UTC)."""
    ts = get_demo_timestamp(10, 15, 30)
    return [{
        "timestamp": ts,
        "host": "auth-srv01",
        "username": "alex.turner",
        "source_ip": "192.168.1.110",
        "event_type": "Authentication",
        "status": "Success",
        "message": "Accepted publickey for alex.turner from 192.168.1.110 port 49210 ssh2",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_demo": 1
    }]

def generate_failed_login_events() -> list:
    """Scenario 2: Single failed authentication event (threshold not reached)."""
    ts = get_demo_timestamp(11, 5, 12)
    return [{
        "timestamp": ts,
        "host": "auth-srv01",
        "username": "m.ross",
        "source_ip": "192.168.1.185",
        "event_type": "Authentication",
        "status": "Failed",
        "message": "Failed password for user m.ross from 192.168.1.185 port 51120 ssh2",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_demo": 1
    }]

def generate_brute_force_events() -> list:
    """Scenario 3: 5 failed login attempts from same IP within 5 minutes."""
    events = []
    base_time = datetime.now(timezone.utc).replace(hour=11, minute=20, second=0, microsecond=0)
    target_users = ["admin", "root", "deployer", "service-acc", "admin"]
    
    for i, user in enumerate(target_users):
        event_time = base_time + timedelta(seconds=i * 25)
        ts_str = event_time.strftime("%Y-%m-%dT%H:%M:%SZ")
        events.append({
            "timestamp": ts_str,
            "host": "auth-srv01",
            "username": user,
            "source_ip": "198.51.100.45",
            "event_type": "Authentication",
            "status": "Failed",
            "message": f"Failed password for user {user} from 198.51.100.45 port {42100 + i} ssh2",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_demo": 1
        })
    return events

def generate_privilege_escalation_events() -> list:
    """Scenario 4: Contextual suspicious privilege escalation."""
    ts = get_demo_timestamp(11, 25, 0)
    return [{
        "timestamp": ts,
        "host": "prod-db-node1",
        "username": "dev-user",
        "source_ip": "10.0.5.22",
        "event_type": "Privilege Escalation",
        "status": "Success",
        "message": "dev-user : TTY=pts/2 ; PWD=/home/dev-user ; USER=root ; COMMAND=/bin/bash",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_demo": 1
    }]

def generate_anomalous_login_events() -> list:
    """Scenario 5: Successful authentication outside normal window (03:17 UTC)."""
    ts = get_demo_timestamp(3, 17, 42)
    return [{
        "timestamp": ts,
        "host": "auth-srv01",
        "username": "sarah.connor",
        "source_ip": "203.0.113.88",
        "event_type": "Authentication",
        "status": "Success",
        "message": "Accepted publickey for sarah.connor from 203.0.113.88 port 54312 ssh2",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_demo": 1
    }]

def execute_scenario(scenario_name: str) -> dict:
    """
    Executes a controlled simulation scenario:
    1. Generates synthetic event(s)
    2. Inserts into SQLite log_events table
    3. Runs detection engine on stored events
    4. Inserts any matched alerts into SQLite alerts table
    5. Returns execution details and updated dashboard statistics
    """
    generators = {
        "normal-login": (generate_normal_login_events, "Normal login event recorded (no alert expected)."),
        "failed-login": (generate_failed_login_events, "Single failed login recorded (threshold 1/5, no alert)."),
        "brute-force": (generate_brute_force_events, "5 failed logins simulated from 198.51.100.45. Potential Brute-Force alert triggered."),
        "privilege-escalation": (generate_privilege_escalation_events, "Privilege escalation by dev-user simulated. Suspicious Privilege Escalation alert triggered."),
        "anomalous-login": (generate_anomalous_login_events, "Login at 03:17 UTC simulated. Anomalous Login Time alert triggered.")
    }

    if scenario_name not in generators:
        raise ValueError(f"Unknown scenario: {scenario_name}")

    gen_func, default_msg = generators[scenario_name]
    raw_events = gen_func()

    # Step 1: Save log events to SQLite
    inserted_events = insert_log_events(raw_events, is_demo=1)

    # Step 2: Retrieve events from SQLite to evaluate detection rules
    all_events = get_log_events(page=1, page_size=1000)

    # Step 3: Run detection engine
    detected_alerts = run_all_detectors(all_events)

    # Step 4: Insert any newly detected alerts (deduplicating existing ones)
    inserted_alerts = insert_alerts(detected_alerts, is_demo=1)

    # Step 5: Gather fresh stats
    stats = get_dashboard_stats()

    return {
        "status": "success",
        "scenario": scenario_name,
        "message": default_msg,
        "events_inserted": len(inserted_events),
        "alerts_generated": len(inserted_alerts),
        "new_alerts": inserted_alerts,
        "stats": stats
    }
