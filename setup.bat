@echo off
echo.
echo ============================================
echo  Perfect Date App - Setup
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed!
    pause
    exit /b 1
)

echo ✅ npm found
echo.

REM Install dependencies
echo Installing dependencies...
npm install

echo.
echo ============================================
echo  Setup Complete! 
echo ============================================
echo.
echo Next steps:
echo 1. Open .env file and add your credentials:
echo    - Gmail App Password
echo    - Google Calendar API keys
echo.
echo 2. Run the server:
echo    npm start
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
echo For detailed setup instructions, see SETUP.md
echo.
pause
