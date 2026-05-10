@echo off
echo 키워드 블로그 앱 실행 중...
cd /d D:\blog-keyword-writer
start cmd /k "node server.js"
timeout /t 3 /nobreak
start http://localhost:3001
