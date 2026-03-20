@echo off
setlocal

:: Get the absolute path to the project directory
set "PROJECT_DIR=d:\1-PC\Downloads\MAPS"
cd /d "%PROJECT_DIR%"

echo [CYBER-MAPS] STARTING TERRITORY INTELLIGENCE DASHBOARD...
echo [SYSTEM] VERIFYING PATH DATA...

:: Check if data exists - generate if missing
if not exist "src\data\salespoints.json" (
    echo [DATA] SALESPOINTS DATA MISSING. GENERATING 30,000 POINTS...
    python gen_data.py
)

:: Check for node_modules
if not exist "node_modules\" (
    echo [DEPS] INSTALLING CORE DEPENDENCIES...
    call npm install
)

echo [SERVER] LAUNCHING HIGH-PERFORMANCE VITE ENGINE...
start "" npm run dev

echo [STATUS] APPLICATION DEPLOYED SUCCESSFULLY.
echo [ACCESS] PLEASE LOG IN TO THE LOCALHOST PORT SHOWN ABOVE.
pause
