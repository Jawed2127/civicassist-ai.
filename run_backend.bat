@echo off
echo Starting CivicAssist AI Backend (Django REST Framework)...
cd /d "%~dp0backend"
call venv\Scripts\activate.bat
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
pause
