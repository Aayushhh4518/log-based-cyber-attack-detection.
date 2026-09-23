from datetime import datetime, timezone

def parse_time(ts_str):
    if not ts_str:
        return None
    try:
        # Python 3.11+ can parse "Z" suffix. For older versions, replace Z with +00:00
        if ts_str.endswith('Z'):
            ts_str = ts_str[:-1] + '+00:00'
        return datetime.fromisoformat(ts_str)
    except Exception:
        return None

def detect_brute_force(events):
    alerts = []
    failed_auths = [e for e in events if e.get('event_type') == 'Authentication' and e.get('status') == 'Failed' and e.get('source_ip')]
    
    # Sort events by timestamp
    sorted_events = []
    for e in failed_auths:
        dt = parse_time(e['timestamp'])
        if dt:
            sorted_events.append((dt, e))
    sorted_events.sort(key=lambda x: x[0])
    
    from collections import defaultdict
    ip_events = defaultdict(list)
    for dt, e in sorted_events:
        ip_events[e['source_ip']].append((dt, e))
        
    for ip, evs in ip_events.items():
        for i in range(len(evs)):
            window = [evs[i][1]]
            for j in range(i+1, len(evs)):
                if (evs[j][0] - evs[i][0]).total_seconds() <= 300: # 5 minutes
                    window.append(evs[j][1])
                else:
                    break
            if len(window) >= 5:
                last_event = window[-1]
                alerts.append({
                    "log_event_id": last_event.get('id'),
                    "severity": "CRITICAL",
                    "detection_type": "Potential Brute-Force Attack",
                    "username": last_event.get('username') or "admin",
                    "source_ip": ip,
                    "timestamp": last_event['timestamp'],
                    "status": "New",
                    "attempts": len(window),
                    "evidence": f"{len(window)} failed login attempts within 5 minutes from source IP {ip}.",
                    "why_flagged": "Multiple failed authentication attempts were detected from the same source IP in a short period.",
                    "recommended_action": "Block source IP temporarily and verify if the user account is under targeted attack.",
                    "is_demo": last_event.get('is_demo', 0)
                })
                break
    return alerts

def detect_privilege_escalation(events):
    alerts = []
    for e in events:
        if e.get('event_type') == 'Privilege Escalation' and e.get('status') == 'Success':
            alerts.append({
                "log_event_id": e.get('id'),
                "severity": "HIGH",
                "detection_type": "Suspicious Privilege Escalation",
                "username": e.get('username') or "Unknown",
                "source_ip": e.get('source_ip') or "N/A",
                "timestamp": e['timestamp'],
                "status": "New",
                "attempts": 1,
                "evidence": f"Successful privilege escalation by {e.get('username')} on {e.get('host') or 'host-system'}.",
                "why_flagged": "Privilege escalation event requires investigation to ensure it aligns with an approved change window.",
                "recommended_action": "Verify authorization for this privilege escalation. Do not assume it is automatically malicious.",
                "is_demo": e.get('is_demo', 0)
            })
    return alerts

def detect_anomalous_login(events):
    alerts = []
    for e in events:
        if e.get('event_type') == 'Authentication' and e.get('status') == 'Success':
            dt = parse_time(e['timestamp'])
            if dt:
                hour = dt.hour
                if hour < 6 or hour >= 22:
                    alerts.append({
                        "log_event_id": e.get('id'),
                        "severity": "MEDIUM",
                        "detection_type": "Anomalous Login Time",
                        "username": e.get('username') or "Unknown",
                        "source_ip": e.get('source_ip') or "N/A",
                        "timestamp": e['timestamp'],
                        "status": "New",
                        "attempts": 1,
                        "evidence": f"Successful login at {dt.strftime('%H:%M:%S')} UTC (outside normal 06:00-22:00 window).",
                        "why_flagged": "An unusual login time is an anomaly requiring investigation, as it occurred outside the normal 06:00-22:00 window.",
                        "recommended_action": "Review user context and verify if the login was expected or initiated by the legitimate owner.",
                        "is_demo": e.get('is_demo', 0)
                    })
    return alerts

def run_all_detectors(events):
    alerts = []
    alerts.extend(detect_brute_force(events))
    alerts.extend(detect_privilege_escalation(events))
    alerts.extend(detect_anomalous_login(events))
    return alerts
