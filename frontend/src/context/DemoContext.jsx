import React, { createContext, useState, useContext } from 'react';

const DemoContext = createContext();

export const useDemo = () => useContext(DemoContext);

export const DemoProvider = ({ children }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demoState, setDemoState] = useState('initial'); // 'initial', 'analyzing', 'complete'
  
  // Initial empty state
  const initialStats = {
    totalEvents: "0",
    securityAlerts: "0",
    highSeverity: "0",
    criticalSeverity: "0"
  };

  const [summaryStats, setSummaryStats] = useState(initialStats);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);

  const runDemoAnalysis = () => {
    setIsAnalyzing(true);
    setDemoState('analyzing');
    
    // Simulate API delay for realism
    setTimeout(() => {
      // 1. Generate Synthetic Logs
      const generatedLogs = [
        // Normal Events
        { id: "L-201", timestamp: "2026-09-21 08:00:15", host: "auth-server", username: "sysadmin", sourceIp: "10.0.1.5", eventType: "System", status: "Info", message: "System startup sequence initiated." },
        { id: "L-202", timestamp: "2026-09-21 08:30:10", host: "vpn-gateway", username: "rsmith", sourceIp: "192.168.1.100", eventType: "VPN Login", status: "Success", message: "User rsmith logged in successfully via VPN" },
        { id: "L-203", timestamp: "2026-09-21 08:45:22", host: "app-server-01", username: "jdoe", sourceIp: "10.0.4.15", eventType: "Web Access", status: "Success", message: "GET /api/health HTTP/1.1 200 OK" },
        { id: "L-204", timestamp: "2026-09-21 09:00:00", host: "auth-server", username: "ajohnson", sourceIp: "172.16.0.42", eventType: "Authentication", status: "Success", message: "Accepted password for ajohnson" },
        { id: "L-205", timestamp: "2026-09-21 09:05:12", host: "db-server", username: "dbadmin", sourceIp: "10.0.1.6", eventType: "System", status: "Success", message: "Database backup completed successfully." },
        
        // Brute Force (5 attempts from 192.168.1.24 within 5 minutes)
        { id: "L-206", timestamp: "2026-09-21 09:12:01", host: "auth-server", username: "admin", sourceIp: "192.168.1.24", eventType: "Authentication", status: "Failed", message: "Failed password for invalid user admin from 192.168.1.24 port 54321 ssh2" },
        { id: "L-207", timestamp: "2026-09-21 09:12:15", host: "auth-server", username: "admin", sourceIp: "192.168.1.24", eventType: "Authentication", status: "Failed", message: "Failed password for invalid user admin from 192.168.1.24 port 54325 ssh2" },
        { id: "L-208", timestamp: "2026-09-21 09:13:02", host: "auth-server", username: "admin", sourceIp: "192.168.1.24", eventType: "Authentication", status: "Failed", message: "Failed password for invalid user admin from 192.168.1.24 port 54330 ssh2" },
        { id: "L-209", timestamp: "2026-09-21 09:13:45", host: "auth-server", username: "admin", sourceIp: "192.168.1.24", eventType: "Authentication", status: "Failed", message: "Failed password for invalid user admin from 192.168.1.24 port 54335 ssh2" },
        { id: "L-210", timestamp: "2026-09-21 09:14:10", host: "auth-server", username: "admin", sourceIp: "192.168.1.24", eventType: "Authentication", status: "Failed", message: "Failed password for invalid user admin from 192.168.1.24 port 54340 ssh2" },
        
        // Normal
        { id: "L-211", timestamp: "2026-09-21 09:15:00", host: "vpn-gateway", username: "bwayne", sourceIp: "192.168.1.55", eventType: "VPN Login", status: "Success", message: "User bwayne logged in successfully via VPN" },
        
        // Privilege Escalation (Suspicious)
        { id: "L-212", timestamp: "2026-09-21 09:20:15", host: "app-server-02", username: "tstark", sourceIp: "10.0.4.15", eventType: "Privilege Escalation", status: "Success", message: "tstark : TTY=pts/0 ; PWD=/home/tstark ; USER=root ; COMMAND=/bin/su - (Unauthorized change window)" },
        
        // Normal
        { id: "L-213", timestamp: "2026-09-21 09:25:33", host: "web-server", username: "-", sourceIp: "203.0.113.45", eventType: "Web Access", status: "Blocked", message: "WAF blocked SQL injection attempt on /login.php" },
        
        // Anomalous Login Time (02:37)
        { id: "L-214", timestamp: "2026-09-21 02:37:05", host: "auth-server", username: "asmith", sourceIp: "172.16.0.42", eventType: "Authentication", status: "Success", message: "Accepted password for asmith from 172.16.0.42 port 49123 ssh2" },
        
        // Normal continued
        { id: "L-215", timestamp: "2026-09-21 10:00:15", host: "auth-server", username: "cpool", sourceIp: "192.168.1.10", eventType: "Authentication", status: "Success", message: "Accepted password for cpool" },
        { id: "L-216", timestamp: "2026-09-21 10:05:22", host: "vpn-gateway", username: "wkent", sourceIp: "192.168.1.11", eventType: "VPN Login", status: "Success", message: "User wkent logged in successfully via VPN" },
        { id: "L-217", timestamp: "2026-09-21 10:10:05", host: "db-server", username: "sysadmin", sourceIp: "10.0.1.5", eventType: "System", status: "Info", message: "Index rebuild completed" },
        { id: "L-218", timestamp: "2026-09-21 10:15:30", host: "app-server-01", username: "rsmith", sourceIp: "10.0.4.16", eventType: "Web Access", status: "Success", message: "POST /api/data HTTP/1.1 201 Created" },
        { id: "L-219", timestamp: "2026-09-21 10:20:45", host: "auth-server", username: "jdoe", sourceIp: "172.16.0.45", eventType: "Authentication", status: "Success", message: "Accepted publickey for jdoe" },
        { id: "L-220", timestamp: "2026-09-21 10:25:10", host: "vpn-gateway", username: "pparker", sourceIp: "192.168.1.12", eventType: "VPN Login", status: "Failed", message: "Failed VPN login for pparker" },
        { id: "L-221", timestamp: "2026-09-21 10:30:00", host: "web-server", username: "-", sourceIp: "203.0.113.50", eventType: "Web Access", status: "Blocked", message: "WAF blocked XSS attempt on /search" },
        { id: "L-222", timestamp: "2026-09-21 10:35:15", host: "app-server-02", username: "tstark", sourceIp: "10.0.4.15", eventType: "System", status: "Info", message: "Application deployed successfully" },
        { id: "L-223", timestamp: "2026-09-21 10:40:22", host: "auth-server", username: "bwayne", sourceIp: "172.16.0.48", eventType: "Authentication", status: "Success", message: "Accepted password for bwayne" },
        { id: "L-224", timestamp: "2026-09-21 10:45:05", host: "db-server", username: "dbadmin", sourceIp: "10.0.1.6", eventType: "System", status: "Success", message: "Vacuum analyze completed" }
      ];

      // 2. Generate Synthetic Alerts
      const generatedAlerts = [
        {
          id: "ALT-9100",
          severity: "Critical",
          detection: "Potential Brute-Force Attack",
          user: "admin",
          sourceIp: "192.168.1.24",
          timestamp: "2026-09-21 09:14:10",
          status: "New",
          details: {
            attempts: 5,
            evidence: "5 failed authentication attempts from 192.168.1.24 within 5 minutes.",
            whyFlagged: "The source IP exceeded the configured failed-login threshold.",
            recommendedAction: "Investigate the source IP and review authentication activity."
          }
        },
        {
          id: "ALT-9101",
          severity: "High",
          detection: "Suspicious Privilege Escalation",
          user: "tstark",
          sourceIp: "10.0.4.15",
          timestamp: "2026-09-21 09:20:15",
          status: "New",
          details: {
            attempts: 1,
            evidence: "User 'tstark' executed '/bin/su -' outside of standard change windows.",
            whyFlagged: "An unprivileged user escalated to root outside of standard change windows.",
            recommendedAction: "Verify if this escalation was authorized. If not, revoke access and reset credentials."
          }
        },
        {
          id: "ALT-9102",
          severity: "Medium",
          detection: "Anomalous Login Time",
          user: "asmith",
          sourceIp: "172.16.0.42",
          timestamp: "2026-09-21 02:37:05",
          status: "New",
          details: {
            attempts: 1,
            evidence: "Successful login at 02:37 AM local time.",
            whyFlagged: "Login event occurred outside the configured normal login window (06:00–22:00).",
            recommendedAction: "Confirm with the user if this was a legitimate out-of-hours login."
          }
        }
      ];

      setLogs(generatedLogs);
      setAlerts(generatedAlerts);
      setSummaryStats({
        totalEvents: "24",
        securityAlerts: "3",
        highSeverity: "1",
        criticalSeverity: "1"
      });
      
      setIsAnalyzing(false);
      setDemoState('complete');
    }, 1500); // 1.5 second loading
  };

  const resetDemo = () => {
    setLogs([]);
    setAlerts([]);
    setSummaryStats(initialStats);
    setDemoState('initial');
  };

  return (
    <DemoContext.Provider value={{
      isAnalyzing,
      demoState,
      summaryStats,
      alerts,
      logs,
      runDemoAnalysis,
      resetDemo
    }}>
      {children}
    </DemoContext.Provider>
  );
};
