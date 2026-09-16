export const summaryStats = {
  totalEvents: "12,486",
  securityAlerts: "37",
  highSeverity: "12",
  criticalSeverity: "3"
};

export const threatActivityData = [
  { time: '00:00', events: 120 },
  { time: '04:00', events: 85 },
  { time: '08:00', events: 320 },
  { time: '12:00', events: 450 },
  { time: '16:00', events: 680 },
  { time: '20:00', events: 210 },
  { time: '24:00', events: 150 },
];

export const detectionBreakdownData = [
  { name: 'Brute Force', value: 45, color: '#ef4444' }, // Red-500
  { name: 'Privilege Escalation', value: 30, color: '#f59e0b' }, // Amber-500
  { name: 'Anomalous Login', value: 25, color: '#3b82f6' }, // Blue-500
];

export const recentAlerts = [
  {
    id: "ALT-9042",
    severity: "Critical",
    detection: "Potential Brute-Force Attack",
    user: "admin",
    sourceIp: "192.168.1.24",
    timestamp: "2026-09-16 09:42:15",
    status: "New",
    details: {
      attempts: 14,
      evidence: "14 failed login attempts from 192.168.1.24 within 5 minutes.",
      whyFlagged: "Multiple failed authentication attempts were observed from the same source within a short time window.",
      recommendedAction: "Investigate the source IP, block it temporarily, and review authentication activity for 'admin'."
    }
  },
  {
    id: "ALT-9041",
    severity: "High",
    detection: "Suspicious Privilege Escalation",
    user: "jdoe",
    sourceIp: "10.0.4.15",
    timestamp: "2026-09-16 09:15:22",
    status: "Investigating",
    details: {
      attempts: 1,
      evidence: "User 'jdoe' successfully executed 'sudo su' after modifying their group membership.",
      whyFlagged: "An unprivileged user escalated to root outside of standard change windows.",
      recommendedAction: "Verify if this escalation was authorized. If not, revoke access and reset credentials."
    }
  },
  {
    id: "ALT-9040",
    severity: "Medium",
    detection: "Anomalous Login Time",
    user: "asmith",
    sourceIp: "172.16.0.42",
    timestamp: "2026-09-16 03:12:05",
    status: "Resolved",
    details: {
      attempts: 1,
      evidence: "Successful login at 03:12 AM local time.",
      whyFlagged: "User 'asmith' historically logs in between 09:00 AM and 05:00 PM. This login deviates significantly from their baseline.",
      recommendedAction: "Confirm with the user if this was a legitimate out-of-hours login."
    }
  },
  {
    id: "ALT-9039",
    severity: "Low",
    detection: "Normal Login Activity",
    user: "bwayne",
    sourceIp: "192.168.1.55",
    timestamp: "2026-09-16 09:05:00",
    status: "Closed",
    details: {
      attempts: 1,
      evidence: "Standard login via VPN.",
      whyFlagged: "Recorded for audit purposes. No suspicious patterns detected.",
      recommendedAction: "None required."
    }
  }
];

export const mockLogs = [
  { id: "L-101", timestamp: "2026-09-16 09:42:15", host: "auth-server-01", username: "admin", sourceIp: "192.168.1.24", eventType: "Authentication", status: "Failed", message: "Failed password for invalid user admin from 192.168.1.24 port 54321 ssh2" },
  { id: "L-102", timestamp: "2026-09-16 09:42:12", host: "auth-server-01", username: "admin", sourceIp: "192.168.1.24", eventType: "Authentication", status: "Failed", message: "Failed password for invalid user admin from 192.168.1.24 port 54320 ssh2" },
  { id: "L-103", timestamp: "2026-09-16 09:42:10", host: "auth-server-01", username: "admin", sourceIp: "192.168.1.24", eventType: "Authentication", status: "Failed", message: "Failed password for invalid user admin from 192.168.1.24 port 54319 ssh2" },
  { id: "L-104", timestamp: "2026-09-16 09:15:22", host: "app-server-02", username: "jdoe", sourceIp: "10.0.4.15", eventType: "Privilege Escalation", status: "Success", message: "jdoe : TTY=pts/0 ; PWD=/home/jdoe ; USER=root ; COMMAND=/bin/su" },
  { id: "L-105", timestamp: "2026-09-16 09:05:00", host: "vpn-gateway", username: "bwayne", sourceIp: "192.168.1.55", eventType: "VPN Login", status: "Success", message: "User bwayne logged in successfully via VPN" },
  { id: "L-106", timestamp: "2026-09-16 08:30:15", host: "db-server-01", username: "sysadmin", sourceIp: "10.0.1.5", eventType: "System", status: "Info", message: "Scheduled backup completed successfully" },
  { id: "L-107", timestamp: "2026-09-16 03:12:05", host: "auth-server-01", username: "asmith", sourceIp: "172.16.0.42", eventType: "Authentication", status: "Success", message: "Accepted password for asmith from 172.16.0.42 port 49123 ssh2" },
  { id: "L-108", timestamp: "2026-09-15 23:45:10", host: "web-server-01", username: "-", sourceIp: "203.0.113.45", eventType: "Web Access", status: "Blocked", message: "WAF blocked SQL injection attempt on /login.php" },
];

export const detectionRules = [
  {
    id: "RULE-001",
    name: "Potential Brute-Force Detection",
    description: "Repeated failed authentication attempts from the same source/user within a defined time window.",
    logic: "COUNT(failed_logins) >= threshold GROUP BY source_ip WITHIN time_window",
    config: { threshold: "5 failed attempts", timeWindow: "5 minutes" },
    status: "Enabled",
    severity: "Critical"
  },
  {
    id: "RULE-002",
    name: "Suspicious Privilege Escalation",
    description: "Detect suspicious privilege-related events where a user/process obtains elevated privileges.",
    logic: "MATCH(event_type == 'Privilege Escalation' AND status == 'Success')",
    config: { context: "Requires non-standard change window or unauthorized user" },
    status: "Enabled",
    severity: "High"
  },
  {
    id: "RULE-003",
    name: "Anomalous Login Time",
    description: "Flag login events occurring outside the configured normal login period.",
    logic: "MATCH(event_type == 'Authentication' AND status == 'Success' AND time NOT IN normal_window)",
    config: { normalWindow: "06:00–22:00" },
    status: "Enabled",
    severity: "Medium"
  }
];
