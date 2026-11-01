@echo off
echo ========================================================
echo  Starting CivicAssist AI Full Stack Application
echo ========================================================
echo.
echo Launching Django Backend on http://127.0.0.1:8000 ...
start "CivicAssist Backend" cmd /k "run_backend.bat"

echo Launching React Frontend on http://localhost:5173 ...
start "CivicAssist Frontend" cmd /k "run_frontend.bat"

echo.
echo Both servers are launching in separate windows!
echo Open your browser at http://localhost:5173
echo.
pause
