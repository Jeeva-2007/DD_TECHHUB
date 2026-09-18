# Enterprise AI Incident Resolution Agent Dashboard — Frontend

Standalone operational dashboard UI for the **DD TECHHUB AI Incident Resolution Agent**.

## Features & Visual Architecture
- **Enterprise Brand Identity**: DD TECHHUB branding with custom Connected Neural Network SVG logo.
- **Fixed Sidebar Navigation**: `Dashboard`, `Incidents`, `Investigations`, `Approvals`, `Audit Trail`, `Settings`.
- **Live Agent Status Indicator**: `● AI Agent Online` with blue pulsing ring.
- **4 Primary Stat Cards**: Animated counting metrics on load.
- **System Health Overview**: Live microservice status monitor (`API Services`, `Payment Service`, `Database`, `Infrastructure`).
- **Interactive AI Investigation**: 2-Column view with Business Impact metrics, Correlated Alerts, Probable Root Cause, AI Confidence Progress Gauge, and Sequential 7-Step Workflow Tracker.
- **Remediation Actions**: Safe automated execution (`restart_db_connections`, `scale_up_otp_capacity`) and High-Risk Human-in-the-Loop approvals.
- **Audit Trail Timeline**: Real-time event log stream.

---

## Directory Structure
```
agent/frontend/
├── src/
│   ├── components/
│   │   ├── AgentSidebar.tsx
│   │   ├── AgentHeader.tsx
│   │   ├── StatCards.tsx
│   │   ├── SystemHealthCard.tsx
│   │   ├── LiveActivityCard.tsx
│   │   ├── IncidentsTable.tsx
│   │   ├── InvestigationView.tsx
│   │   └── AuditTrailView.tsx
│   ├── pages/
│   │   └── AgentDashboardPage.tsx
│   └── services/
│       └── api.ts
└── README.md
```
