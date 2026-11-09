@echo off
setlocal
cd /d C:\Users\akshay2007\Downloads\HABITT~1
"C:\Users\akshay2007\AppData\Local\ms-playwright-go\1.50.1\node.exe" -r .\scripts\vite-windows-safe-realpath.cjs .\node_modules\vite\bin\vite.js build --configLoader runner
