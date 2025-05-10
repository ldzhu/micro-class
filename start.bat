@echo off

:: Step 1: Build frontend and sync
call build-frontend.bat

:: Step 2: Install backend dependencies
cd backend || exit /b
npm install --production

:: Step 3: Start server using PM2
pm2 delete all
pm2 start src\app.js --no-daemon
pm2 save
pm2 startup

exit /b 0
