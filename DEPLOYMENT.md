# 🚀 CivicAssist AI - Production Deployment Guide

This guide covers three proven deployment strategies for **CivicAssist AI** (React + Django + PostgreSQL):

- **Method 1: Cloud PaaS (Render / Railway / Vercel)** — *Easiest & Recommended for quick hosting*
- **Method 2: Docker & Docker Compose** — *Portable, 1-command deployment for any cloud VM/VPS*
- **Method 3: Linux VPS (Ubuntu 22.04+ with Nginx, Gunicorn & SSL)** — *Maximum performance & control*

---

## 📋 Pre-Deployment Production Checklist

Before deploying to any environment:
- [x] Set `DEBUG=False` in environment variables.
- [x] Generate a secure random `SECRET_KEY`.
- [x] Whitelist your production domains in `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS`.
- [x] Ensure `whitenoise` is configured for static files (already enabled in `settings.py`).
- [x] Point `VITE_API_BASE_URL` to your live backend URL (e.g. `https://api.yourdomain.com/api`).

---

## 🌐 Method 1: Cloud PaaS (Render / Railway / Vercel)

### Option A: 1-Click Infrastructure via Render (`render.yaml`)
This repository includes a [`render.yaml`](./render.yaml) file configured to spin up:
1. A managed **PostgreSQL Database**
2. A **Django Web Service** running Gunicorn + WhiteNoise
3. A **React Static Site** with CDN and SPA rewrites

#### Steps:
1. Push this project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for CivicAssist AI"
   git branch -M main
   git remote add origin https://github.com/<your-username>/civicassist-ai.git
   git push -u origin main
   ```
2. Log in to [Render.com](https://render.com).
3. Click **New +** ➔ **Blueprint**.
4. Connect your GitHub repository. Render will automatically detect `render.yaml` and provision:
   - `civicassist-db` (Postgres)
   - `civicassist-backend` (Django API)
   - `civicassist-frontend` (React SPA)
5. Click **Apply**. Once built, your app is live on HTTPS with automated SSL certificates!

---

### Option B: Split Deployment (Backend on Railway/Render + Frontend on Vercel)

#### Step 1: Deploy PostgreSQL & Django on Railway or Render
1. Create a **PostgreSQL** instance on Railway or Render. Copy the `DATABASE_URL`.
2. Create a new Web Service pointing to the `/backend` folder.
3. Configure Environment Variables:
   ```env
   DEBUG=False
   SECRET_KEY=your-secure-random-secret-key
   DATABASE_URL=postgres://user:password@host:port/dbname
   ALLOWED_HOSTS=.railway.app,.onrender.com,yourdomain.com
   CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   CSRF_TRUSTED_ORIGINS=https://*.railway.app,https://*.onrender.com,https://*.vercel.app
   ```
4. Build Command:
   ```bash
   ./build.sh
   ```
   *(or: `pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate && python seed_data.py`)*
5. Start Command:
   ```bash
   gunicorn civicassist.wsgi:application --bind 0.0.0.0:$PORT --workers 3
   ```

#### Step 2: Deploy React on Vercel
1. Go to [Vercel.com](https://vercel.com) ➔ **Add New Project**.
2. Select your repository. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-app.onrender.com/api`
4. Click **Deploy**. Vercel will build and deploy the React frontend globally on their Edge CDN.

---

## 🐳 Method 2: Docker & Docker Compose

Deploy the entire stack (PostgreSQL + Django/Gunicorn + React/Nginx) with a single command on any VPS (AWS EC2, DigitalOcean Droplet, GCP, Hetzner, or local server).

### 1. Requirements
Ensure Docker and Docker Compose are installed on the server:
```bash
docker --version
docker compose version
```

### 2. Launch Stack
In the project root directory, run:
```bash
docker compose up -d --build
```

### 3. What Happens Automatically:
1. **`db`**: Initializes PostgreSQL with persistent data volume `postgres_data`.
2. **`backend`**: Waits for PostgreSQL to be healthy, executes `migrate` and `seed_data.py`, and starts Gunicorn on port 8000.
3. **`frontend`**: Multi-stage Docker build compiles the Vite application and starts Nginx on port 80 and 5173, reverse-proxying `/api/` calls directly to the backend.

### 4. Verify & Manage:
```bash
# Check container status
docker compose ps

# View live backend logs
docker compose logs -f backend

# Stop services
docker compose down
```

Open your browser at `http://your-server-ip` or `http://localhost`.

---

## 🖥️ Method 3: Traditional Linux VPS (Ubuntu 22.04 / 24.04)

Complete walkthrough for deploying directly on an Ubuntu VPS (AWS EC2, DigitalOcean, Linode).

### Step 1: System Packages & PostgreSQL Setup
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv git nginx postgresql postgresql-contrib

# Create PostgreSQL database and user
sudo -u postgres psql
```
```sql
CREATE DATABASE civicassist_db;
CREATE USER civicuser WITH PASSWORD 'strongpassword123';
ALTER ROLE civicuser SET client_encoding TO 'utf8';
ALTER ROLE civicuser SET default_transaction_isolation TO 'read committed';
ALTER ROLE civicuser SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE civicassist_db TO civicuser;
\q
```

### Step 2: Clone & Configure Backend
```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/<your-username>/civicassist-ai.git
sudo chown -R $USER:$USER /var/www/civicassist-ai
cd civicassist-ai/backend

# Create virtual environment & install requirements
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env
nano .env
```
Add:
```env
DEBUG=False
SECRET_KEY=generate-a-strong-random-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,localhost,127.0.0.1
USE_POSTGRES=True
DB_NAME=civicassist_db
DB_USER=civicuser
DB_PASSWORD=strongpassword123
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

Run migrations and collect static assets:
```bash
python manage.py migrate
python seed_data.py
python manage.py collectstatic --no-input
```

### Step 3: Create Systemd Service for Gunicorn
```bash
sudo nano /etc/systemd/system/civicassist-backend.service
```
Paste:
```ini
[Unit]
Description=CivicAssist AI Gunicorn Daemon
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/var/www/civicassist-ai/backend
ExecStart=/var/www/civicassist-ai/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 civicassist.wsgi:application

[Install]
WantedBy=multi-user.target
```
Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl start civicassist-backend
sudo systemctl enable civicassist-backend
sudo systemctl status civicassist-backend
```

### Step 4: Build React Frontend
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

cd /var/www/civicassist-ai/frontend
npm install
VITE_API_BASE_URL=/api npm run build
```

### Step 5: Configure Nginx as Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/civicassist
```
Paste:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # React Static Assets
    root /var/www/civicassist-ai/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Django API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Admin Panel
    location /admin/ {
        proxy_pass http://127.0.0.1:8000/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Static Files
    location /static/ {
        alias /var/www/civicassist-ai/backend/staticfiles/;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/civicassist /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Install Free SSL Certificate with Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot will automatically install SSL and set up automatic renewal!

---

## 🛡️ Database Backup Strategy (Production)

To automate daily backups of your PostgreSQL database:
```bash
# Create backup directory
mkdir -p /home/ubuntu/backups

# Add to crontab: runs every night at 2:00 AM
crontab -e
```
Add the cron line:
```cron
0 2 * * * pg_dump -U civicuser civicassist_db | gzip > /home/ubuntu/backups/civicassist_$(date +\%Y\%m\%d).sql.gz
```
