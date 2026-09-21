# Frontend Code Review — Log-Based Cyber Attack Detection

**Reviewer:** Independent architecture and code review  
**Scope:** All files under `frontend/src/`, `package.json`, `vite.config.js`  
**Commit:** `bd05f1e` (feat: add security monitoring pages)

---

## A. Critical Issues

### A1. `AlertDetails` modal has no Escape-key or backdrop-click dismissal
[AlertDetails.jsx](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/components/AlertDetails.jsx) and the log details modal in [LogExplorer.jsx](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/pages/LogExplorer.jsx) can only be closed by clicking the X or Close button. A user who presses Escape or clicks the dark backdrop will be trapped. This is a usability defect and will feel broken during a live demonstration.

### A2. `AlertsTable` "View All" button is a dead link
[AlertsTable.jsx:32](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/components/AlertsTable.jsx#L32) renders a "View All" button that does nothing. Since the Dashboard and Security Alerts pages exist, this button should either navigate to the Security Alerts page or be removed. A non-functional button on the main Dashboard is noticeable during a viva.

### A3. `AlertsTable` renders no empty state when `alerts` is `[]`
If all filters on the Security Alerts page eliminate every result, the table body renders zero rows with no message. [LogExplorer.jsx:126-131](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/pages/LogExplorer.jsx#L126-L131) correctly handles this, but `AlertsTable` does not. This inconsistency would be visible during a demonstration.

### A4. Reports page "Export Report" button does nothing
[Reports.jsx:16-18](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/pages/Reports.jsx#L16-L18) — the button has no `onClick`. Either wire it to a simple `window.print()` or add a tooltip stating "Available after backend integration." A non-functional primary action button is a critical UI defect.

---

## B. Medium Issues

### B1. Header always shows "Security Overview" regardless of page
[Header.jsx](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/components/Header.jsx) is static. When navigating to Settings or Log Explorer, the header still says "Security Overview — Monitor system logs and investigate suspicious security events." This is misleading. Consider accepting a `pageTitle` prop or deriving it from the current page.

### B2. Header says "Monitoring active" without a backend
[Header.jsx:19](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/components/Header.jsx#L19) — the phrase "System Status: Monitoring active" implies a live detection engine is running. Since the backend does not exist yet, this could be questioned during a viva. Either change the wording to "System Status: Demo Mode" or tie it to the Settings page's monitoring toggle.

### B3. Sidebar "System Status: Online" is hardcoded
[Sidebar.jsx:51-57](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/components/Sidebar.jsx#L51-L57) — same concern as B2. The green "Online" indicator implies a live backend connection. In demo mode, this should either read "Demo" or be visually neutral.

### B4. Settings state is isolated — not shared with any other component
[Settings.jsx](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/pages/Settings.jsx) manages its own local state. If a user changes the brute-force threshold to 10, the Detection Rules page still displays "5 failed attempts." This is inconsistent. For an academic project, either:
- Lift the settings state to `App.jsx` and pass it down, or
- Add a visible note: "Settings will take effect after backend integration."

### B5. `summaryStats` values are strings, not numbers
[demoData.js:1-6](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/data/demoData.js#L1-L6) — `totalEvents: "12,486"` is a pre-formatted string. When the FastAPI backend returns `{ total_events: 12486 }`, these will need formatting. This is not a bug now, but it introduces a subtle integration risk. Consider storing raw numbers and formatting in the component.

### B6. SecurityAlerts page has no "Clear Filters" button
[LogExplorer.jsx](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/pages/LogExplorer.jsx) has a Clear Filters button, but [SecurityAlerts.jsx](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/pages/SecurityAlerts.jsx) does not. This is an inconsistency between two pages with nearly identical filter UIs.

---

## C. Minor Issues

### C1. `ThreatActivityChart` and `DetectionBreakdown` import data directly
These chart components ([ThreatActivityChart.jsx:3](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/components/ThreatActivityChart.jsx#L3), [DetectionBreakdown.jsx:3](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/components/DetectionBreakdown.jsx#L3)) import `demoData` directly rather than accepting data as props. This makes them less reusable and slightly harder to swap to backend data later. Not critical — the import can simply be changed — but accepting a `data` prop would be cleaner.

### C2. Severity color/icon maps are duplicated
Severity-to-color mappings exist separately in:
- [AlertsTable.jsx:4-17](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/components/AlertsTable.jsx#L4-L17) (SeverityBadge)
- [AlertDetails.jsx:7-12](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/components/AlertDetails.jsx#L7-L12)
- [DetectionRules.jsx:6-18](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/pages/DetectionRules.jsx#L6-L18)

Extracting these into a shared utility (e.g., `utils/severity.js`) would reduce duplication and ensure consistency.

### C3. `demoData.js` has no top-level comment marking it as demonstration data
The LogExplorer has a visible "DEMONSTRATION DATA" badge, but the data file itself has no JSDoc comment or header clearly stating its purpose. Adding a comment like `/** DEMONSTRATION DATA — Replace with FastAPI responses */` would be valuable documentation for a viva.

### C4. `App.css` is unused
No component imports `App.css`. If it still exists from the Vite scaffold, it should be removed.

### C5. LogExplorer modal displays raw JSON
[LogExplorer.jsx:153-155](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/pages/LogExplorer.jsx#L153-L155) — `JSON.stringify(selectedLog, null, 2)` works but is not a polished presentation. For a viva, consider a structured key-value layout similar to how `AlertDetails` presents its data.

---

## D. What Should Remain Unchanged

| Area | Verdict |
|---|---|
| **Component architecture** (`components/` vs `pages/` vs `data/`) | Clean, well-separated, easy to explain in a viva. Keep. |
| **State-based routing** (`currentPage` in App.jsx) | Appropriate for the project scope. Adding react-router would be over-engineering. Keep. |
| **Centralized demo data** (`demoData.js`) | Single source of truth. Every page imports from one file. Keep. |
| **Cybersecurity terminology** | "Potential Brute-Force Attack", "Suspicious Privilege Escalation", "Anomalous Login Time" — all correctly hedged. **Excellent.** Keep. |
| **Alert detail content** | "Why it was flagged", "Evidence", "Recommended Action" sections demonstrate genuine security analysis reasoning. Keep. |
| **Detection Rules page** | Clearly presents rule logic, thresholds, and pseudocode without claiming a real engine is running. Keep. |
| **Dark SOC theme consistency** | All pages share the same visual language. Keep. |
| **Dependency footprint** | Only `react`, `react-dom`, `recharts`, `lucide-react`, `tailwindcss`. Minimal and defensible. Keep. |
| **`AlertsTable` prop-based design** | Accepts `alerts` and `onRowClick` as props — properly reusable across Dashboard and SecurityAlerts. Keep. |
| **`StatCard` reusable component** | Used identically in Dashboard and Reports. Clean. Keep. |

---

## E. Backend Integration Risks

| Risk | Location | Impact |
|---|---|---|
| `summaryStats` values are pre-formatted strings | [demoData.js:1-6](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/data/demoData.js#L1-L6) | Backend will return numbers. Every consumer will need formatting logic added. |
| Chart components import data directly | `ThreatActivityChart`, `DetectionBreakdown` | Cannot pass backend-fetched data as props without refactoring the components. |
| Settings state is local to `Settings.jsx` | [Settings.jsx](file:///c:/DEV/Projects/log-based-cyber-attack-detection/frontend/src/pages/Settings.jsx) | Backend config endpoints will need a way to push/pull settings. Local state won't survive page switches. |
| Alert data shape mismatch potential | `recentAlerts` has nested `details` object | Backend response shape must exactly match `{ id, severity, detection, user, sourceIp, timestamp, status, details: { attempts, evidence, whyFlagged, recommendedAction } }` or the AlertDetails component will crash on `alert.details.whyFlagged`. |
| No loading or error states anywhere | All pages | When data comes from `fetch()`, users will see nothing while requests are in flight and crashes on network errors. |

---

## F. Recommended Fixes Before Backend Development

These are ordered by impact. Items 1–4 are functional bugs; items 5–7 are polish.

| # | Fix | Files | Effort |
|---|---|---|---|
| 1 | Add Escape key and backdrop-click dismissal to `AlertDetails` and LogExplorer modal | `AlertDetails.jsx`, `LogExplorer.jsx` | Small |
| 2 | Add empty-state row to `AlertsTable` when `alerts.length === 0` | `AlertsTable.jsx` | Trivial |
| 3 | Wire "View All" button on Dashboard to navigate to Security Alerts page (requires `setCurrentPage` prop or remove the button) | `AlertsTable.jsx`, `Dashboard.jsx` | Small |
| 4 | Wire "Export Report" to `window.print()` or add a "coming soon" tooltip | `Reports.jsx` | Trivial |
| 5 | Add a `/** DEMONSTRATION DATA */` header comment to `demoData.js` | `demoData.js` | Trivial |
| 6 | Change Header "Monitoring active" to "Demo Mode" or make it dynamic | `Header.jsx` | Trivial |
| 7 | Add "Clear Filters" button to SecurityAlerts page | `SecurityAlerts.jsx` | Small |

---

## Verdict

**CHANGES REQUIRED** — Fix items 1–4 from Section F before proceeding to backend development. These are functional defects (dead buttons, missing empty states, no keyboard dismissal) that will be visible during a viva demonstration and undermine the professional quality of the project. The remaining items (5–7) are recommended polish but not blocking.

The overall architecture, component design, data centralization, and cybersecurity terminology are strong and academically defensible. The codebase is well-structured for a single student to explain and extend.
