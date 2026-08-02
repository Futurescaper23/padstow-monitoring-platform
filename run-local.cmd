@echo off
setlocal
cd /d "%~dp0"

echo Starting FutureScaping monitoring system on http://localhost:3080
start "" http://localhost:3080
node server.js
