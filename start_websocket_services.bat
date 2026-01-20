@echo off
echo Starting WebSocket Real-Time System...
echo.

echo Starting Laravel Reverb Server...
start "Reverb Server" cmd /k "php artisan reverb:start"

timeout /t 3 /nobreak >nul

echo Starting Laravel Application...
start "Laravel App" cmd /k "php artisan serve"

timeout /t 3 /nobreak >nul

echo Starting Vite Dev Server...
start "Vite Dev" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Python Serial Handler...
start "Python Handler" cmd /k "cd python && python3 serial_handler.py"

echo.
echo All services started!
echo.
echo Services running:
echo - Laravel Reverb: http://localhost:8080
echo - Laravel App: http://localhost:8000
echo - Vite Dev: http://localhost:3000
echo - Python Handler: http://localhost:5001
echo.
echo Open http://localhost:8000/dashboard to see real-time updates!
echo.
pause
