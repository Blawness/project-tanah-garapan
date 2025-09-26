@echo off
echo ========================================
echo   Tanah Garapan - Production Build
echo ========================================
echo.

echo [1/4] Installing production dependencies...
call npm ci --production
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo Error: Failed to generate Prisma client
    pause
    exit /b 1
)

echo.
echo [3/4] Building application...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Failed to build application
    pause
    exit /b 1
)

echo.
echo [4/4] Creating production package...
if not exist "dist" mkdir dist
xcopy /E /I /Y "src" "dist\src"
xcopy /E /I /Y "prisma" "dist\prisma"
xcopy /E /I /Y "public" "dist\public"
xcopy /E /I /Y "uploads" "dist\uploads" 2>nul
copy "package.json" "dist\"
copy "package-lock.json" "dist\"
copy "next.config.ts" "dist\"
copy "tsconfig.json" "dist\"
copy "ecosystem.config.js" "dist\"
copy ".env.example" "dist\.env"

echo.
echo ========================================
echo   Production build completed!
echo   Files ready in 'dist' folder
echo ========================================
echo.
echo Next steps for VPS deployment:
echo 1. Upload 'dist' folder to VPS
echo 2. Run 'npm install' on VPS
echo 3. Setup database and environment
echo 4. Start with PM2: pm2 start ecosystem.config.js
echo.
pause
