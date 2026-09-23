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
                created_at TEXT,
                is_demo INTEGER DEFAULT 0
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
                is_demo INTEGER DEFAULT 0,
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
        
        # Check and add is_demo column to existing tables if missing
        cursor.execute("PRAGMA table_info(log_events)")
        log_columns = [row[1] for row in cursor.fetchall()]
        if "is_demo" not in log_columns:
            cursor.execute("ALTER TABLE log_events ADD COLUMN is_demo INTEGER DEFAULT 0")

        cursor.execute("PRAGMA table_info(alerts)")
        alert_columns = [row[1] for row in cursor.fetchall()]
        if "is_demo" not in alert_columns:
            cursor.execute("ALTER TABLE alerts ADD COLUMN is_demo INTEGER DEFAULT 0")

        # Seed or update detection rules
        cursor.execute("SELECT COUNT(*) FROM detection_rules")
        rule_count = cursor.fetchone()[0]
        now_iso = datetime.now(timezone.utc).isoformat()
        
        rules = [
            (
                1,
                "Potential Brute-Force Detection",
                "Detects multiple failed login attempts from the same IP address within a short time window.",
                "CRITICAL",
                1,
                5,
                5,
                None,
                None,
                "COUNT(failed_logins) >= 5 GROUP BY source_ip WITHIN 5 minutes",
                now_iso
            ),
            (
                2,
                "Suspicious Privilege Escalation",
                "Contextual detection of privilege elevation events requiring change authorization review.",
                "HIGH",
                1,
                None,
                None,
                None,
                None,
                "event_type == 'Privilege Escalation' AND status == 'Success' (Contextual review required)",
                now_iso
            ),
            (
                3,
                "Anomalous Login Time",
                "Detects successful authentication occurring outside the established 06:00-22:00 normal window.",
                "MEDIUM",
                1,
                None,
                None,
                "06:00",
                "22:00",
                "event_type == 'Authentication' AND status == 'Success' AND (time < 06:00 OR time >= 22:00 UTC)",
                now_iso
            )
        ]

        if rule_count == 0:
            cursor.executemany("""
                INSERT INTO detection_rules (
                    id, name, description, severity, enabled, threshold, 
                    time_window_minutes, normal_start_time, normal_end_time, logic, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, rules)
        else:
            # Update existing rules to ensure descriptions and logic are clean and accurate
            for r in rules:
                cursor.execute("""
                    UPDATE detection_rules 
                    SET name = ?, description = ?, severity = ?, enabled = ?, threshold = ?,
                        time_window_minutes = ?, normal_start_time = ?, normal_end_time = ?, logic = ?
                    WHERE id = ?
                """, (r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[0]))
            
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
    """Return detection rules transformed for frontend consumption."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM detection_rules")
        rules = []
        for row in cursor.fetchall():
            r = dict(row)
            # Build a config dict from the individual DB columns
            config = {}
            if r.get('threshold') is not None:
                config['threshold'] = f"{r['threshold']} failed attempts"
            if r.get('time_window_minutes') is not None:
                config['timeWindow'] = f"{r['time_window_minutes']} minutes"
            if r.get('normal_start_time') and r.get('normal_end_time'):
                config['normalWindow'] = f"{r['normal_start_time']}-{r['normal_end_time']}"
            if not config:
                config['context'] = r.get('description', 'Contextual security check')

            rules.append({
                'id': r['id'],
                'rule_code': f"RULE-{str(r['id']).zfill(3)}",
                'name': r['name'],
                'description': r['description'],
                'severity': r['severity'].capitalize(),
                'status': 'Enabled' if r.get('enabled', 1) else 'Disabled',
                'threshold': r.get('threshold'),
                'time_window_minutes': r.get('time_window_minutes'),
                'normal_start_time': r.get('normal_start_time'),
                'normal_end_time': r.get('normal_end_time'),
                'logic': r.get('logic', ''),
                'config': config,
                'created_at': r.get('created_at')
            })
        return rules
    finally:
        conn.close()

def insert_log_events(events: list, is_demo: int = 0) -> list:
    """Inserts a list of normalized log events and returns inserted records with assigned IDs."""
    if not events:
        return []
        
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        inserted_events = []
        for e in events:
            demo_val = e.get('is_demo', is_demo)
            cursor.execute("""
                INSERT INTO log_events 
                (timestamp, host, username, source_ip, event_type, status, message, created_at, is_demo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                e['timestamp'], e.get('host'), e.get('username'), e.get('source_ip'),
                e['event_type'], e.get('status'), e.get('message'),
                e.get('created_at') or datetime.now(timezone.utc).isoformat(),
                demo_val
            ))
            new_id = cursor.lastrowid
            e_copy = dict(e)
            e_copy['id'] = new_id
            e_copy['is_demo'] = demo_val
            inserted_events.append(e_copy)
                
        conn.commit()
        return inserted_events
    finally:
        conn.close()

def get_log_events(page: int = 1, page_size: int = 50):
    """Retrieve paginated log events ordered by latest first."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        offset = (page - 1) * page_size
        cursor.execute("SELECT * FROM log_events ORDER BY id DESC LIMIT ? OFFSET ?", (page_size, offset))
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()

def insert_alerts(alerts: list, is_demo: int = 0) -> list:
    """Inserts a list of alerts, avoiding duplicates on the same log_event_id and detection_type."""
    if not alerts:
        return []
        
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        cursor.execute("SELECT log_event_id, detection_type FROM alerts WHERE log_event_id IS NOT NULL")
        existing = set((row['log_event_id'], row['detection_type']) for row in cursor.fetchall())
        
        inserted_alerts = []
        for a in alerts:
            demo_val = a.get('is_demo', is_demo)
            event_id = a.get('log_event_id')
            if event_id and (event_id, a['detection_type']) in existing:
                continue

            cursor.execute("""
                INSERT INTO alerts 
                (log_event_id, severity, detection_type, username, source_ip, timestamp, status, attempts, evidence, why_flagged, recommended_action, created_at, is_demo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                event_id, a['severity'], a['detection_type'], a.get('username'), a.get('source_ip'),
                a['timestamp'], a.get('status', 'New'), a.get('attempts'), a.get('evidence'), a.get('why_flagged'), a.get('recommended_action'),
                datetime.now(timezone.utc).isoformat(),
                demo_val
            ))
            new_id = cursor.lastrowid
            if event_id:
                existing.add((event_id, a['detection_type']))
            a_copy = dict(a)
            a_copy['id'] = f"ALT-{str(new_id).zfill(3)}"
            inserted_alerts.append(a_copy)
                
        conn.commit()
        return inserted_alerts
    finally:
        conn.close()

def clear_demo_data(clear_all: bool = False):
    """Clears demonstration records from alerts and log_events while preserving detection rules."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        if clear_all:
            cursor.execute("DELETE FROM alerts")
            cursor.execute("DELETE FROM log_events")
            cursor.execute("DELETE FROM sqlite_sequence WHERE name IN ('alerts', 'log_events')")
            deleted_logs = cursor.rowcount
            deleted_alerts = cursor.rowcount
        else:
            cursor.execute("DELETE FROM alerts WHERE is_demo = 1")
            deleted_alerts = cursor.rowcount
            cursor.execute("DELETE FROM log_events WHERE is_demo = 1")
            deleted_logs = cursor.rowcount
            # If no non-demo logs exist, reset auto-increment
            cursor.execute("SELECT COUNT(*) FROM log_events")
            if cursor.fetchone()[0] == 0:
                cursor.execute("DELETE FROM sqlite_sequence WHERE name IN ('alerts', 'log_events')")
        conn.commit()
        return {"status": "success", "deleted_logs": deleted_logs, "deleted_alerts": deleted_alerts}
    finally:
        conn.close()

def get_alerts(severity=None, detection_type=None, status=None, search=None, page=1, page_size=50):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        query = "SELECT * FROM alerts WHERE 1=1"
        params = []
        if severity and severity != 'All':
            query += " AND severity COLLATE NOCASE = ?"
            params.append(severity)
        if detection_type and detection_type != 'All':
            query += " AND detection_type = ?"
            params.append(detection_type)
        if status and status != 'All':
            query += " AND status = ?"
            params.append(status)
        if search:
            query += " AND (username LIKE ? OR source_ip LIKE ? OR detection_type LIKE ? OR id LIKE ?)"
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param, search_param])
            
        offset = (page - 1) * page_size
        query += " ORDER BY id DESC LIMIT ? OFFSET ?"
        params.extend([page_size, offset])
        
        cursor.execute(query, params)
        
        alerts = []
        for row in cursor.fetchall():
            alert_dict = dict(row)
            alerts.append({
                "id": f"ALT-{str(alert_dict['id']).zfill(3)}",
                "severity": alert_dict['severity'].capitalize(),
                "detection": alert_dict['detection_type'],
                "user": alert_dict['username'] or "Unknown",
                "sourceIp": alert_dict['source_ip'] or "N/A",
                "timestamp": alert_dict['timestamp'],
                "status": alert_dict['status'],
                "details": {
                    "attempts": alert_dict['attempts'],
                    "evidence": alert_dict['evidence'],
                    "whyFlagged": alert_dict['why_flagged'],
                    "recommendedAction": alert_dict['recommended_action']
                }
            })
        return alerts
    finally:
        conn.close()

def get_alert_by_id(alert_id: int):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
        row = cursor.fetchone()
        if not row:
            return None
        alert_dict = dict(row)
        return {
            "id": f"ALT-{str(alert_dict['id']).zfill(3)}",
            "severity": alert_dict['severity'].capitalize(),
            "detection": alert_dict['detection_type'],
            "user": alert_dict['username'] or "Unknown",
            "sourceIp": alert_dict['source_ip'] or "N/A",
            "timestamp": alert_dict['timestamp'],
            "status": alert_dict['status'],
            "details": {
                "attempts": alert_dict['attempts'],
                "evidence": alert_dict['evidence'],
                "whyFlagged": alert_dict['why_flagged'],
                "recommendedAction": alert_dict['recommended_action']
            }
        }
    finally:
        conn.close()

def get_dashboard_stats():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM log_events")
        total_events = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM alerts")
        total_alerts = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM alerts WHERE severity COLLATE NOCASE = 'HIGH'")
        high_severity = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM alerts WHERE severity COLLATE NOCASE = 'CRITICAL'")
        critical_severity = cursor.fetchone()[0]
        
        cursor.execute("SELECT detection_type, COUNT(*) as count FROM alerts GROUP BY detection_type")
        breakdown = [{"name": row[0], "value": row[1]} for row in cursor.fetchall()]
        
        cursor.execute("SELECT strftime('%H:00', timestamp) as time, COUNT(*) as events FROM log_events GROUP BY time")
        event_activity = {row[0]: row[1] for row in cursor.fetchall()}
        
        cursor.execute("SELECT strftime('%H:00', timestamp) as time, COUNT(*) as alerts FROM alerts GROUP BY time")
        alert_activity = {row[0]: row[1] for row in cursor.fetchall()}
        
        all_times = sorted(list(set(list(event_activity.keys()) + list(alert_activity.keys()))))
        activity = []
        for t in all_times:
            activity.append({
                "time": t,
                "events": event_activity.get(t, 0),
                "alerts": alert_activity.get(t, 0)
            })
            
        # Fetch recent alerts (last 5)
        cursor.execute("SELECT * FROM alerts ORDER BY id DESC LIMIT 5")
        recent = []
        for row in cursor.fetchall():
            a = dict(row)
            recent.append({
                "id": f"ALT-{str(a['id']).zfill(3)}",
                "severity": a['severity'].capitalize(),
                "detection": a['detection_type'],
                "user": a['username'] or "Unknown",
                "sourceIp": a['source_ip'] or "N/A",
                "timestamp": a['timestamp'],
                "status": a['status'],
                "details": {
                    "attempts": a['attempts'],
                    "evidence": a['evidence'],
                    "whyFlagged": a['why_flagged'],
                    "recommendedAction": a['recommended_action']
                }
            })

        return {
            "totalEvents": total_events,
            "securityAlerts": total_alerts,
            "highSeverity": high_severity,
            "criticalSeverity": critical_severity,
            "detectionBreakdown": breakdown,
            "threatActivity": activity,
            "recentAlerts": recent
        }
    finally:
        conn.close()

