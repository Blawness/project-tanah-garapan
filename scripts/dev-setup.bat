@echo off
echo ========================================
echo   Tanah Garapan - Development Setup
echo ========================================
echo.

echo [1/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/5] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo Error: Failed to generate Prisma client
    pause
    exit /b 1
)

echo.
echo [3/5] Pushing database schema...
call npx prisma db push
if %errorlevel% neq 0 (
    echo Error: Failed to push database schema
    pause
    exit /b 1
)

echo.
echo [4/5] Seeding database...
call npm run db:seed
if %errorlevel% neq 0 (
    echo Warning: Database seeding failed, but continuing...
)

echo.
echo [5/5] Starting development server...
echo.
echo ========================================
echo   Development server starting...
echo   URL: http://localhost:3000
echo   Press Ctrl+C to stop
echo ========================================
echo.

call npm run dev
