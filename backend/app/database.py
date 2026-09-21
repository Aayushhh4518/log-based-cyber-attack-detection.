import sqlite3
from pathlib import Path
from datetime import datetime, timezone

# Define paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "security.db"

def get_db_connection():
    """Create a database connection and return it."""
    # Ensure data directory exists
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def initialize_database():
    """Initialize the database with tables and initial seed data."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        # Create log_events table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS log_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                host TEXT,
                username TEXT,
                source_ip TEXT,
                event_type TEXT NOT NULL,
                status TEXT,
                message TEXT,
                created_at TEXT
            )
        """)
        
        # Create alerts table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                log_event_id INTEGER,
                severity TEXT NOT NULL,
                detection_type TEXT NOT NULL,
                username TEXT,
                source_ip TEXT,
                timestamp TEXT NOT NULL,
                status TEXT NOT NULL,
                attempts INTEGER,
                evidence TEXT,
                why_flagged TEXT,
                recommended_action TEXT,
                created_at TEXT,
                FOREIGN KEY(log_event_id) REFERENCES log_events(id)
            )
        """)
        
        # Create detection_rules table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS detection_rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                severity TEXT NOT NULL,
                enabled INTEGER NOT NULL DEFAULT 1,
                threshold INTEGER,
                time_window_minutes INTEGER,
                normal_start_time TEXT,
                normal_end_time TEXT,
                logic TEXT,
                created_at TEXT
            )
        """)
        
        # Seed detection rules if table is empty
        cursor.execute("SELECT COUNT(*) FROM detection_rules")
        if cursor.fetchone()[0] == 0:
            now_iso = datetime.now(timezone.utc).isoformat()
            rules = [
                (
                    "Potential Brute-Force Detection",
                    "Detects multiple failed login attempts from the same IP address.",
                    "CRITICAL",
                    1,
                    5,
                    5,
                    None,
                    None,
                    "COUNT(failed_logins) >= threshold GROUP BY source_ip WITHIN time_window",
                    now_iso
                ),
                (
                    "Suspicious Privilege Escalation",
                    "Context: non-standard change window or unauthorized user",
                    "HIGH",
                    1,
                    None,
                    None,
                    None,
                    None,
                    "logic should represent detection of successful privilege escalation but do NOT state that every successful privilege escalation is automatically malicious.",
                    now_iso
                ),
                (
                    "Anomalous Login Time",
                    "Detects successful authentication occurring outside the normal window.",
                    "MEDIUM",
                    1,
                    None,
                    None,
                    "06:00",
                    "22:00",
                    "successful authentication occurring outside the normal window.",
                    now_iso
                )
            ]
            
            cursor.executemany("""
                INSERT INTO detection_rules (
                    name, description, severity, enabled, threshold, 
                    time_window_minutes, normal_start_time, normal_end_time, logic, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, rules)
            
        conn.commit()
    finally:
        conn.close()

def get_tables():
    """Return a list of all tables in the database."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        return [row["name"] for row in cursor.fetchall() if row["name"] != "sqlite_sequence"]
    finally:
        conn.close()

def get_rules():
    """Return a list of all detection rules."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM detection_rules")
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()
