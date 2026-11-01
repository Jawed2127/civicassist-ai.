# 🏛️ CivicAssist AI

> **An AI-powered public grievance management system that helps citizens report civic issues, track complaints in real-time, and enables municipal administrators to manage resolutions and field dispatches.**

---

## 🌟 Key Features

### 1. 🙋‍♂️ Citizen Portal
- **Rapid Issue Reporting**: Citizens submit grievances with title, detailed description, GPS location, and photos.
- **Real-Time AI Triage Feedback**: As citizens type, the AI engine pre-evaluates category, urgency rating, safety hazard indicators, and estimated resolution SLA.
- **Duplicate Issue Detection**: Proactively flags if a nearby resident has already reported the same pothole, water leak, or street light failure within 250m.
- **Live Ticket Tracking**: Instant lookup by unique Ticket ID (e.g. `CIVIC-2026-F6F6EC`) with visual milestone timeline.
- **Citizen Feedback & Verification**: Citizens can officially verify resolution or reopen tickets if repairs are unsatisfactory.

### 2. 🧠 Civic Triage AI Engine
- **NLP Urgency Scoring & Hazard Detection**: Automatically prioritizes high-risk emergencies (live wires, gas leaks, road cave-ins, open manholes) as **P1 CRITICAL** with 6-hour SLA targets.
- **Smart Department Routing**: Automatically routes grievances to the relevant municipal department (*Roads*, *Sanitation*, *Water Board*, *Electrical*, *Health*).
- **Geospatial & Lexical Duplicate Clustering**: Employs Haversine distance and Jaccard token similarity to prevent duplicated field dispatches.

### 3. 🏛️ Municipal Admin Command Center
- **Executive KPI Dashboard**: Live tracking of total tickets, open P1 emergencies, in-progress dispatches, and SLA adherence rate.
- **Dispatch & Status Workflow**: Field supervisors can transition tickets through `TRIAGED` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `VERIFIED`.
- **Ward-Level Heatmap & Distribution**: Visual workload breakdown by municipal ward and category.
- **Audit Resolution Log**: Immutable timeline logging of every status update, assigned contractor, and field note.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React Icons |
| **Backend** | Python 3.10+, Django 5, Django REST Framework (DRF), `django-cors-headers` |
| **Database** | PostgreSQL 18 (with SQLite fallback for instant zero-dependency testing) |
| **AI/ML Engine** | Rule-based & NLP Heuristics, Geo-spatial Haversine Clustering, Hazard Lexicon |

---
