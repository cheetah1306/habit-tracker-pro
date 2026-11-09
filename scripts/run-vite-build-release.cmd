@echo off
setlocal
cd /d C:\Users\akshay2007\Downloads\HABITT~1
node -r .\scripts\vite-windows-safe-realpath.cjs .\node_modules\vite\bin\vite.js build --configLoader runner
