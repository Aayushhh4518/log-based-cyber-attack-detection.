import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

const API_BASE = 'http://localhost:8000/api';

export const ApiProvider = ({ children }) => {
  const [summaryStats, setSummaryStats] = useState({
    totalEvents: 0,
    securityAlerts: 0,
    highSeverity: 0,
    criticalSeverity: 0,
    detectionBreakdown: [],
    threatActivity: [],
    recentAlerts: []
  });

  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'disconnected' | 'checking'
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null); // { type: 'success' | 'error' | 'info', text: '' }

  // Settings state for demonstration
  const [settings, setSettings] = useState({
    monitoringEnabled: true,
    bruteForceThreshold: 5,
    bruteForceWindow: 5,
    loginStart: '06:00',
    loginEnd: '22:00',
    alertPref: { critical: true, high: true, medium: true, low: false }
  });

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (res.ok) {
        const data = await res.json();
        setSummaryStats(data);
        setBackendStatus('connected');
        return data;
      } else {
        setBackendStatus('disconnected');
      }
    } catch (e) {
      setBackendStatus('disconnected');
    }
    return null;
  }, []);

  // Check health on mount and periodically
  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const runSimulator = async (scenarioName) => {
    setIsSimulatorRunning(true);
    setActiveScenario(scenarioName);
    setFeedbackMessage(null);

    const endpoint = scenarioName === 'clear' 
      ? `${API_BASE}/demo/clear` 
      : `${API_BASE}/demo/${scenarioName}`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setBackendStatus('connected');
      
      if (data.stats) {
        setSummaryStats(data.stats);
      } else {
        await fetchStats();
      }

      setFeedbackMessage({
        type: 'success',
        text: data.message || `Scenario ${scenarioName} completed successfully.`
      });

      return data;
    } catch (err) {
      setBackendStatus('disconnected');
      setFeedbackMessage({
        type: 'error',
        text: 'Backend unavailable. Start FastAPI server.'
      });
      return null;
    } finally {
      setIsSimulatorRunning(false);
      setActiveScenario(null);
    }
  };

  const clearFeedback = () => setFeedbackMessage(null);

  return (
    <ApiContext.Provider value={{
      API_BASE,
      summaryStats,
      backendStatus,
      isSimulatorRunning,
      activeScenario,
      feedbackMessage,
      settings,
      setSettings,
      fetchStats,
      runSimulator,
      clearFeedback
    }}>
      {children}
    </ApiContext.Provider>
  );
};
