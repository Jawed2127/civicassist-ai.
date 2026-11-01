# CivicAssist AI - Backend Dockerfile
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for psycopg2 and Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . /app/

# Collect static files
RUN python manage.py collectstatic --no-input || true

EXPOSE 8000

# Run with Gunicorn production WSGI server
CMD ["gunicorn", "civicassist.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]
