@echo off
chcp 65001 >nul
"%~dp0..\fish-voice\venv\Scripts\python.exe" "%~dp0set_key.py"
echo.
pause
