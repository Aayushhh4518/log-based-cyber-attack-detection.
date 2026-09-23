import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.database import (
    initialize_database, get_rules, get_dashboard_stats,
    get_log_events, get_alerts, clear_demo_data
)
from app.services.simulator import execute_scenario

def test_full_simulator_pipeline():
    print("=== Step 1: Initializing Database ===")
    initialize_database()
    rules = get_rules()
    assert len(rules) == 3, f"Expected 3 rules, got {len(rules)}"
    print(f"Verified {len(rules)} detection rules:")
    for r in rules:
        print(f"  [{r['rule_code']}] {r['name']} ({r['severity']}): {r['logic']}")

    print("\n=== Step 2: Clearing Database to Clean State ===")
    clear_demo_data(clear_all=True)
    initial_stats = get_dashboard_stats()
    assert initial_stats['totalEvents'] == 0, f"Expected 0 events, got {initial_stats['totalEvents']}"
    assert initial_stats['securityAlerts'] == 0, f"Expected 0 alerts, got {initial_stats['securityAlerts']}"
    print("Initial stats verified: 0 events, 0 alerts.")

    print("\n=== Step 3: Testing Scenario 1 - Normal Login ===")
    res1 = execute_scenario("normal-login")
    assert res1['events_inserted'] == 1, "Expected 1 event inserted"
    assert res1['alerts_generated'] == 0, "Expected 0 alerts generated"
    assert res1['stats']['totalEvents'] == 1
    assert res1['stats']['securityAlerts'] == 0
    print(f"Scenario 1 passed: {res1['message']} (Events: {res1['stats']['totalEvents']}, Alerts: {res1['stats']['securityAlerts']})")

    print("\n=== Step 4: Testing Scenario 2 - Failed Login ===")
    res2 = execute_scenario("failed-login")
    assert res2['events_inserted'] == 1, "Expected 1 event inserted"
    assert res2['alerts_generated'] == 0, "Expected 0 alerts (threshold not met)"
    assert res2['stats']['totalEvents'] == 2
    assert res2['stats']['securityAlerts'] == 0
    print(f"Scenario 2 passed: {res2['message']} (Events: {res2['stats']['totalEvents']}, Alerts: {res2['stats']['securityAlerts']})")

    print("\n=== Step 5: Testing Scenario 3 - Brute-Force Attack ===")
    res3 = execute_scenario("brute-force")
    assert res3['events_inserted'] == 5, f"Expected 5 events inserted, got {res3['events_inserted']}"
    assert res3['alerts_generated'] == 1, f"Expected 1 alert generated, got {res3['alerts_generated']}"
    assert res3['stats']['totalEvents'] == 7, f"Expected 7 events, got {res3['stats']['totalEvents']}"
    assert res3['stats']['securityAlerts'] == 1, f"Expected 1 alert, got {res3['stats']['securityAlerts']}"
    assert res3['stats']['criticalSeverity'] == 1, f"Expected 1 Critical alert, got {res3['stats']['criticalSeverity']}"
    print(f"Scenario 3 passed: {res3['message']} (Events: {res3['stats']['totalEvents']}, Critical Alerts: {res3['stats']['criticalSeverity']})")

    print("\n=== Step 6: Testing Scenario 4 - Suspicious Privilege Escalation ===")
    res4 = execute_scenario("privilege-escalation")
    assert res4['events_inserted'] == 1, "Expected 1 event inserted"
    assert res4['alerts_generated'] == 1, f"Expected 1 alert generated, got {res4['alerts_generated']}"
    assert res4['stats']['totalEvents'] == 8
    assert res4['stats']['securityAlerts'] == 2
    assert res4['stats']['highSeverity'] == 1
    print(f"Scenario 4 passed: {res4['message']} (Events: {res4['stats']['totalEvents']}, High Alerts: {res4['stats']['highSeverity']})")

    print("\n=== Step 7: Testing Scenario 5 - Anomalous Login Time ===")
    res5 = execute_scenario("anomalous-login")
    assert res5['events_inserted'] == 1, "Expected 1 event inserted"
    assert res5['alerts_generated'] == 1, f"Expected 1 alert generated, got {res5['alerts_generated']}"
    assert res5['stats']['totalEvents'] == 9
    assert res5['stats']['securityAlerts'] == 3
    print(f"Scenario 5 passed: {res5['message']} (Events: {res5['stats']['totalEvents']}, Total Alerts: {res5['stats']['securityAlerts']})")

    print("\n=== Step 8: Verifying Alert Details from SQLite ===")
    alerts = get_alerts()
    assert len(alerts) == 3, f"Expected 3 alerts in database, got {len(alerts)}"
    for a in alerts:
        print(f"  [{a['id']}] Severity: {a['severity']} | Type: {a['detection']} | User: {a['user']} | IP: {a['sourceIp']}")
        print(f"      Evidence: {a['details']['evidence']}")
        print(f"      Why Flagged: {a['details']['whyFlagged']}")
        print(f"      Recommended Action: {a['details']['recommendedAction']}")
        assert a['details']['evidence'], "Evidence must not be empty"
        assert a['details']['whyFlagged'], "Why flagged must not be empty"
        assert a['details']['recommendedAction'], "Recommended action must not be empty"

    print("\n=== Step 9: Verifying Log Explorer Records from SQLite ===")
    logs = get_log_events(page=1, page_size=50)
    assert len(logs) == 9, f"Expected 9 logs in database, got {len(logs)}"
    print(f"Verified {len(logs)} log records retrieved successfully.")

    print("\n=== Step 10: Testing Clear Demo Data ===")
    clear_res = clear_demo_data(clear_all=False)
    cleared_stats = get_dashboard_stats()
    assert cleared_stats['totalEvents'] == 0, f"Expected 0 events after clear, got {cleared_stats['totalEvents']}"
    assert cleared_stats['securityAlerts'] == 0, f"Expected 0 alerts after clear, got {cleared_stats['securityAlerts']}"
    # Verify detection rules were NOT deleted
    rules_after_clear = get_rules()
    assert len(rules_after_clear) == 3, "Detection rules must be preserved after clear_demo_data!"
    print(f"Clear Demo Data passed: {clear_res}. Rules preserved: {len(rules_after_clear)} rules intact.")

    print("\nALL BACKEND SIMULATOR TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_simulator_pipeline()
