# Step 1: Build frontend and sync
./build-frontend.sh

# Step 2: Install backend dependencies
cd backend || exit
npm install --production

# Step 3: Start server using PM2
pm2 delete all || true
pm2 start src/app.js --no-daemon
pm2 save
pm2 startup
