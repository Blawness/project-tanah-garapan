@echo off
echo =========================================
echo   Project Tanah Garapan - Quick Setup
echo =========================================
echo.

echo [1/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/5] Generating Prisma client...
call npx prisma generate
if errorlevel 1 (
    echo Error: Failed to generate Prisma client
    pause
    exit /b 1
)

echo.
echo [3/5] Setting up database schema...
call npm run db:push
if errorlevel 1 (
    echo Error: Failed to setup database schema
    echo Make sure MySQL is running and database exists
    pause
    exit /b 1
)

echo.
echo [4/5] Seeding database with sample data...
call npm run db:seed
if errorlevel 1 (
    echo Error: Failed to seed database
    pause
    exit /b 1
)

echo.
echo [5/5] Creating uploads directory...
if not exist "uploads" mkdir uploads
if not exist "uploads\tanah-garapan" mkdir uploads\tanah-garapan

echo.
echo =========================================
echo   Setup completed successfully!
echo =========================================
echo.
echo Demo accounts:
echo   Developer: developer@example.com / password123
echo   Admin:     admin@example.com / password123
echo   Manager:   manager@example.com / password123
echo   User:      user@example.com / password123
echo.
echo Starting development server...
echo Visit: http://localhost:3000
echo.
call npm run dev
