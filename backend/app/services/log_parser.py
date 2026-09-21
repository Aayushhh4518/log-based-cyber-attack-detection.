import re
from datetime import datetime, timezone
import os

def parse_log_line(line: str) -> dict:
    """Parses a single syslog-style line and returns a normalized dictionary."""
    line = line.strip()
    if not line:
        return None
        
    # Standard format: TIMESTAMP HOST PROCESS: MESSAGE
    # Example: 2026-10-10T08:00:01Z server-01 sshd: Accepted publickey for jsmith from 192.168.1.24 port 50112 ssh2
    match = re.match(r"^(\S+) (\S+) (\S+): (.*)$", line)
    if not match:
        return None
        
    timestamp, host, process, message = match.groups()
    
    username = None
    source_ip = None
    event_type = "System"
    status = "Info"
    
    if process == "sshd":
        event_type = "Authentication"
        if "Accepted" in message:
            status = "Success"
            m = re.search(r"for (\S+) from (\S+)", message)
            if m:
                username, source_ip = m.groups()
        elif "Failed" in message:
            status = "Failed"
            m = re.search(r"user (\S+) from (\S+)", message)
            if m:
                username, source_ip = m.groups()
            else:
                m = re.search(r"for (\S+) from (\S+)", message)
                if m:
                    username, source_ip = m.groups()
                    
    elif process == "sudo":
        event_type = "Privilege Escalation"
        status = "Success"
        m = re.match(r"^(\S+) :", message)
        if m:
            username = m.group(1)
            
    elif process == "vpn":
        event_type = "VPN Login"
        if "successful" in message:
            status = "Success"
        elif "failed" in message:
            status = "Failed"
        m = re.search(r"user (\S+) from (\S+)", message)
        if m:
            username, source_ip = m.groups()
            
    elif process == "nginx":
        event_type = "Web Access"
        m = re.match(r"^(\S+)", message)
        if m:
            source_ip = m.group(1)
        if " 403 " in message or " 401 " in message:
            status = "Blocked"
        elif " 200 " in message:
            status = "Success"
            
    elif process == "systemd":
        event_type = "System"
        status = "Info"
        m = re.search(r"user (\S+)\.", message)
        if m:
            username = m.group(1)

    return {
        "timestamp": timestamp,
        "host": host,
        "username": username,
        "source_ip": source_ip,
        "event_type": event_type,
        "status": status,
        "message": message,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

def parse_log_file(filepath: str) -> list:
    """Reads a log file and returns a list of normalized events."""
    events = []
    if not os.path.exists(filepath):
        return events
        
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            parsed = parse_log_line(line)
            if parsed:
                events.append(parsed)
                
    return events
