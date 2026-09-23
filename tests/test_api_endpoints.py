import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api():
    print("=== Testing GET /api/health ===")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    print("Health check OK:", res.json())

    print("\n=== Testing GET /api/rules ===")
    res = client.get("/api/rules")
    assert res.status_code == 200
    rules = res.json()
    assert len(rules) == 3
    print(f"Loaded {len(rules)} rules:")
    for r in rules:
        print(f"  - {r['rule_code']}: {r['name']} ({r['severity']})")

    print("\n=== Testing POST /api/demo/clear ===")
    res = client.post("/api/demo/clear")
    assert res.status_code == 200
    stats = client.get("/api/stats").json()
    assert stats['totalEvents'] == 0
    assert stats['securityAlerts'] == 0
    print("Database cleared. Stats:", stats)

    print("\n=== Testing POST /api/demo/normal-login ===")
    res = client.post("/api/demo/normal-login")
    assert res.status_code == 200
    body = res.json()
    assert body['events_inserted'] == 1
    assert body['alerts_generated'] == 0
    print("Normal login result:", body['message'])

    print("\n=== Testing POST /api/demo/failed-login ===")
    res = client.post("/api/demo/failed-login")
    assert res.status_code == 200
    body = res.json()
    assert body['events_inserted'] == 1
    assert body['alerts_generated'] == 0
    print("Failed login result:", body['message'])

    print("\n=== Testing POST /api/demo/brute-force ===")
    res = client.post("/api/demo/brute-force")
    assert res.status_code == 200
    body = res.json()
    assert body['events_inserted'] == 5
    assert body['alerts_generated'] == 1
    print("Brute-force result:", body['message'])

    print("\n=== Testing POST /api/demo/privilege-escalation ===")
    res = client.post("/api/demo/privilege-escalation")
    assert res.status_code == 200
    body = res.json()
    assert body['events_inserted'] == 1
    assert body['alerts_generated'] == 1
    print("Privilege escalation result:", body['message'])

    print("\n=== Testing POST /api/demo/anomalous-login ===")
    res = client.post("/api/demo/anomalous-login")
    assert res.status_code == 200
    body = res.json()
    assert body['events_inserted'] == 1
    assert body['alerts_generated'] == 1
    print("Anomalous login result:", body['message'])

    print("\n=== Testing GET /api/stats ===")
    res = client.get("/api/stats")
    assert res.status_code == 200
    stats = res.json()
    assert stats['totalEvents'] == 9
    assert stats['securityAlerts'] == 3
    assert stats['criticalSeverity'] == 1
    assert stats['highSeverity'] == 1
    print(f"Stats: Total Events: {stats['totalEvents']}, Alerts: {stats['securityAlerts']} (Critical: {stats['criticalSeverity']}, High: {stats['highSeverity']})")

    print("\n=== Testing GET /api/alerts ===")
    res = client.get("/api/alerts")
    assert res.status_code == 200
    alerts = res.json()
    assert len(alerts) == 3
    first_alert_id = alerts[0]['id'].replace("ALT-", "")
    print(f"Retrieved {len(alerts)} alerts. First alert ID: {alerts[0]['id']}")

    print("\n=== Testing GET /api/alerts/{id} ===")
    res = client.get(f"/api/alerts/{int(first_alert_id)}")
    assert res.status_code == 200
    single_alert = res.json()
    assert single_alert['details']['whyFlagged']
    assert single_alert['details']['evidence']
    assert single_alert['details']['recommendedAction']
    print(f"Alert {single_alert['id']} details verified: Why: {single_alert['details']['whyFlagged'][:40]}...")

    print("\n=== Testing GET /api/logs ===")
    res = client.get("/api/logs?page_size=50")
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) == 9
    print(f"Retrieved {len(logs)} log events.")

    print("\n=== Testing POST /api/demo/clear ===")
    res = client.post("/api/demo/clear")
    assert res.status_code == 200
    stats = client.get("/api/stats").json()
    assert stats['totalEvents'] == 0
    assert stats['securityAlerts'] == 0
    print("Cleared demo data. Stats:", stats)

    print("\nALL API ENDPOINTS TESTED AND VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_api()
