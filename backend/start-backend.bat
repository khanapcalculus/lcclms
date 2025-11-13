@echo off
cd /d "%~dp0"
set PORT=4000
set MONGODB_URI=mongodb+srv://khanapcalculus:Thazhath12@cluster0.ipy6r.mongodb.net/lcclms?retryWrites=true^&w=majority
set JWT_SECRET=abcdefghijklmnopqrstuvwxyz1234567890ABCDEF
set CLIENT_ORIGIN=http://192.168.31.169:5173
set NODE_ENV=development
echo Starting backend server...
npm run dev
pause

