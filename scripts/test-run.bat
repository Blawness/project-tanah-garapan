@echo off
echo ========================================
echo   Tanah Garapan - Running Tests
echo ========================================
echo.

echo [1/3] Running unit tests...
call npm test
if %errorlevel% neq 0 (
    echo Warning: Some tests failed
)

echo.
echo [2/3] Running tests with coverage...
call npm run test:coverage
if %errorlevel% neq 0 (
    echo Warning: Coverage tests failed
)

echo.
echo [3/3] Running linting...
call npm run lint
if %errorlevel% neq 0 (
    echo Warning: Linting issues found
)

echo.
echo ========================================
echo   Test run completed
echo ========================================
pause
