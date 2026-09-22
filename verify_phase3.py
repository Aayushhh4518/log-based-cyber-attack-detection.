import urllib.request
import json
import sqlite3
import os
from pathlib import Path

BASE_DIR = Path(r"c:\DEV\Projects\log-based-cyber-attack-detection\backend\data")
DB_PATH = BASE_DIR / "security.db"

def main():
    results = {}
    
    # 1. POST /api/logs/parse
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/api/logs/parse", method="POST")
        with urllib.request.urlopen(req) as response:
            results['post1_status'] = response.getcode()
            results['post1_body'] = json.loads(response.read().decode())
    except Exception as e:
        results['post1_error'] = str(e)
        
    # 2. POST /api/logs/parse SECOND TIME
    try:
        req2 = urllib.request.Request("http://127.0.0.1:8000/api/logs/parse", method="POST")
        with urllib.request.urlopen(req2) as response2:
            results['post2_status'] = response2.getcode()
            results['post2_body'] = json.loads(response2.read().decode())
    except Exception as e:
        results['post2_error'] = str(e)
        
    # 3. GET /api/logs
    try:
        req3 = urllib.request.Request("http://127.0.0.1:8000/api/logs")
        with urllib.request.urlopen(req3) as response3:
            results['get_status'] = response3.getcode()
            body3 = json.loads(response3.read().decode())
            results['get_count'] = len(body3)
            results['get_first3'] = body3[:3]
    except Exception as e:
        results['get_error'] = str(e)
        
    # 4. DATABASE QUERIES
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM log_events")
        results['db_log_events'] = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM alerts")
        results['db_alerts'] = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM detection_rules")
        results['db_rules'] = cursor.fetchone()[0]
        
        conn.close()
    except Exception as e:
        results['db_error'] = str(e)

    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()
