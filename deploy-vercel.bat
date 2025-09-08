@echo off
echo ================================
echo   Deploying Lethimdo to Vercel
echo ================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: Please run this script from the Lethimdo project root directory
    echo Expected: c:\Users\user\lethimdo\
    pause
    exit /b 1
)

echo [1/3] Installing Vercel CLI...
npm install -g vercel
if %errorlevel% neq 0 (
    echo Error: Failed to install Vercel CLI
    pause
    exit /b 1
)

echo [2/3] Deploying to Vercel...
echo Note: When prompted, set the root directory to 'frontend'
echo.
vercel --prod
if %errorlevel% neq 0 (
    echo Error: Deployment failed
    pause
    exit /b 1
)

echo [3/3] Deployment complete!
echo.
echo ================================
echo   Deployment Successful!
echo ================================
echo.
echo Your Lethimdo platform is now live!
echo Check your Vercel dashboard for the live URL
echo.
echo Next steps:
echo 1. Set environment variables in Vercel dashboard
echo 2. Deploy backend to Railway
echo 3. Update CORS settings
echo.
pause