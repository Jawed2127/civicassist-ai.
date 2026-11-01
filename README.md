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

## 🚀 Quick Start Guide

### Option 1: Double-Click Runner (Windows)
Double-click `start_all.bat` in the project root to automatically launch both the Django backend and React frontend in separate command windows.

---

### Option 2: Manual Terminal Startup

#### 1. Backend (Django)
```bash
cd backend

# Activate virtual environment
venv\Scripts\activate

# Run migrations (already seeded, but safe to run)
python manage.py migrate

# Seed sample civic issues & departments
python seed_data.py

# Start Django server
python manage.py runserver 127.0.0.1:8000
```
*Backend API will run at: `http://127.0.0.1:8000/api/`*  
*Django Admin Panel: `http://127.0.0.1:8000/admin/`*

#### 2. Frontend (React + Vite)
```bash
cd frontend

# Start Vite dev server
npm run dev
```
*Frontend will run at: `http://localhost:5173/`*

---

## 🐘 Configuring PostgreSQL 18

The project includes `psycopg2-binary` and is pre-configured to connect to PostgreSQL.

1. Open your PostgreSQL terminal (`psql` or pgAdmin) and create the database:
   ```sql
   CREATE DATABASE civicassist_db;
   ```
2. Open `backend/.env` and update your PostgreSQL credentials:
   ```env
   USE_POSTGRES=True
   DB_NAME=civicassist_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   ```
3. Run migrations and seed data:
   ```bash
   python manage.py migrate
   python seed_data.py
   ```

*(Note: If `USE_POSTGRES=False`, the application automatically uses local SQLite so you can test immediately with zero database setup).*

---

## 📡 API Reference Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/grievances/` | List all grievances (supports filters: `status`, `urgency`, `category`, `ward`, `search`) |
| `POST` | `/api/grievances/` | Create grievance (auto-runs AI triage, routes department, generates ticket) |
| `GET` | `/api/grievances/{id}/` | Retrieve single grievance with timeline & AI analysis |
| `POST` | `/api/grievances/{id}/update-status/` | Update grievance status (`ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `VERIFIED`, `REOPENED`) |
| `GET` | `/api/grievances/track/{ticket_number}/` | Direct citizen lookup by Ticket Number (e.g. `CIVIC-2026-F6F6EC`) |
| `POST` | `/api/triage/preview/` | Live AI preview endpoint (category, urgency, hazards, duplicate check) |
| `GET` | `/api/analytics/summary/` | Municipal KPIs, resolution rates, category & ward breakdowns |
| `GET` | `/api/departments/` | List all municipal departments and default SLAs |

---

## 🧪 Running Automated Tests

```bash
cd backend
venv\Scripts\activate
python manage.py test
```
*Runs unit and integration tests verifying grievance creation, AI urgency tagging, status lifecycle, and analytics endpoints.*

---

## 🚢 Production Deployment

Complete instructions are provided in [**`DEPLOYMENT.md`**](./DEPLOYMENT.md):

1. **Cloud 1-Click PaaS (Render / Railway / Vercel)**:
   - Use the included [`render.yaml`](./render.yaml) blueprint to launch PostgreSQL, Django backend, and React frontend automatically with free SSL.
2. **Docker Compose**:
   - Run `docker compose up -d --build` to deploy the entire stack (PostgreSQL + Django/Gunicorn + React/Nginx) on any Linux VPS or cloud instance.
3. **Ubuntu VPS (Nginx + Gunicorn + Certbot SSL)**:
   - Full configuration for AWS EC2, DigitalOcean, or Linode with automated systemd daemon and Let's Encrypt certificates.
