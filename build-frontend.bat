@echo off
setlocal

:: 配置路径
set FRONTEND_DIR=frontend
set DIST_DIR=%FRONTEND_DIR%\dist
set BACKEND_PUBLIC=backend\public

:: 检查 frontend 目录是否存在
if not exist "%FRONTEND_DIR%" (
    echo Error: Frontend directory not found
    exit /b 1
)

:: 创建 backend\public 目录（如果不存在）
if not exist "%BACKEND_PUBLIC%" (
    mkdir "%BACKEND_PUBLIC%"
)

:: 构建前端
echo Building frontend...
cd /d "%FRONTEND_DIR%"
npm run build
cd /d "%~dp0%"

:: 删除目标目录下的所有文件和子目录
echo Syncing files...
if exist "%BACKEND_PUBLIC%\*" (
    del /q /f "%BACKEND_PUBLIC%\*"
    for /d %%x in ("%BACKEND_PUBLIC%\*") do @rd /s /q "%%x"
)

:: 复制 dist 内容到 public
xcopy /e /i /y "%DIST_DIR%" "%BACKEND_PUBLIC%"

echo Frontend build completed.
endlocal
