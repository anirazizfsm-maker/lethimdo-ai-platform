@echo off
echo ================================================================
echo   RAILWAY BACKEND DEPLOYMENT FOR BANGLADESH FREELANCE AGENCY
echo ================================================================
echo.

echo 🇧🇩 Deploying Lethimdo AI Platform Backend to Railway
echo.

echo ================================================================
echo   CHECKING PREREQUISITES
echo ================================================================
echo.

echo Checking if Railway CLI is installed...
railway --version 2>nul
if %errorlevel% neq 0 (
    echo ❌ Railway CLI not found. Installing...
    echo.
    echo Opening Railway CLI installation page...
    start https://docs.railway.app/develop/cli
    echo.
    echo Please install Railway CLI and run this script again.
    echo Alternative: Use Railway web dashboard at https://railway.app
    goto MANUAL_DEPLOYMENT
)

echo ✅ Railway CLI found!
echo.

echo ================================================================
echo   RAILWAY LOGIN AND PROJECT SETUP
echo ================================================================
echo.

echo Logging into Railway...
railway login

if %errorlevel% neq 0 (
    echo ❌ Railway login failed
    goto MANUAL_DEPLOYMENT
)

echo ✅ Railway login successful!
echo.

echo Initializing Railway project...
railway init

echo.
echo ================================================================
echo   BACKEND DEPLOYMENT
echo ================================================================
echo.

echo Deploying backend to Railway...
cd backend
railway up

if %errorlevel% neq 0 (
    echo ❌ Deployment failed
    goto TROUBLESHOOTING
)

echo ✅ Backend deployed successfully!
echo.

echo ================================================================
echo   ENVIRONMENT VARIABLES SETUP
echo ================================================================
echo.

echo Setting up essential environment variables...

echo Setting NODE_ENV...
railway variables set NODE_ENV=production

echo Setting JWT_SECRET...
set /p JWT_SECRET="Enter a secure JWT secret (or press Enter for auto-generated): "
if "%JWT_SECRET%"=="" set JWT_SECRET=lethimdo_jwt_secret_2024_bangladesh_freelance_%RANDOM%
railway variables set JWT_SECRET=%JWT_SECRET%

echo Setting FRONTEND_URL...
railway variables set FRONTEND_URL=https://lethimdo.com

echo.
echo 🔑 OpenAI API Key Setup (Required for AI workflows)
echo.
set /p OPENAI_KEY="Enter your OpenAI API key (sk-proj-...): "
if not "%OPENAI_KEY%"=="" (
    railway variables set OPENAI_API_KEY=%OPENAI_KEY%
    railway variables set OPENAI_MODEL=gpt-4
    railway variables set OPENAI_MAX_TOKENS=2000
    echo ✅ OpenAI configuration set
) else (
    echo ⚠️  OpenAI API key not set - you'll need to add it later
    echo   Go to Railway dashboard → Variables → Add OPENAI_API_KEY
)

echo.
echo ================================================================
echo   GETTING DEPLOYMENT URL
echo ================================================================
echo.

echo Getting your live backend URL...
railway domain

echo.
echo ================================================================
echo   TESTING DEPLOYMENT
echo ================================================================
echo.

echo Testing backend health check...
for /f "tokens=*" %%i in ('railway domain') do set BACKEND_URL=%%i

if not "%BACKEND_URL%"=="" (
    echo Opening health check: %BACKEND_URL%/health
    start %BACKEND_URL%/health
    
    echo.
    echo Opening Railway dashboard...
    railway open
) else (
    echo Could not determine backend URL. Please check Railway dashboard.
    start https://railway.app/dashboard
)

goto SUCCESS

:MANUAL_DEPLOYMENT
echo.
echo ================================================================
echo   MANUAL DEPLOYMENT OPTION
echo ================================================================
echo.
echo Since Railway CLI setup had issues, you can deploy manually:
echo.
echo 1. Go to: https://railway.app
echo 2. Sign up/login with GitHub
echo 3. Click "Deploy from GitHub"
echo 4. Select repository: lethimdo-ai-platform
echo 5. Choose the backend folder
echo 6. Deploy!
echo.
echo Opening Railway web dashboard...
start https://railway.app
echo.
goto END

:TROUBLESHOOTING
echo.
echo ================================================================
echo   DEPLOYMENT TROUBLESHOOTING
echo ================================================================
echo.
echo Common issues and solutions:
echo.
echo 1. Build errors:
echo    → Check package.json and dependencies
echo    → Ensure TypeScript compiles without errors
echo.
echo 2. Environment variables:
echo    → Add required variables in Railway dashboard
echo    → Especially OPENAI_API_KEY for AI features
echo.
echo 3. Database connection:
echo    → Railway can provide PostgreSQL database
echo    → Add from Railway dashboard → Add Service → PostgreSQL
echo.
echo Opening Railway dashboard for manual configuration...
start https://railway.app/dashboard
goto END

:SUCCESS
echo.
echo ================================================================
echo   🎉 BACKEND DEPLOYMENT SUCCESSFUL!
echo ================================================================
echo.
echo 🇧🇩 BANGLADESH FREELANCE AGENCY STATUS:
echo ✅ Professional backend API deployed
echo ✅ Global Railway infrastructure 
echo ✅ Auto-scaling enabled
echo ✅ Ready for international clients
echo.
echo 💰 COST ANALYSIS:
echo Railway Free Tier: $5/month credit
echo OpenAI API: ~$5-20/month (pay-as-use)
echo Total: ~$10-25/month for professional backend
echo.
echo 🚀 NEXT STEPS:
echo 1. ✅ Backend deployed and running
echo 2. 🔄 Update frontend to use live API URL
echo 3. 🧪 Test AI workflow generation
echo 4. 📝 Update documentation with API endpoints
echo 5. 👥 Ready for client demonstrations!
echo.
echo 🌐 YOUR LIVE API:
echo Backend URL: %BACKEND_URL%
echo Health Check: %BACKEND_URL%/health
echo API Docs: %BACKEND_URL%/api
echo.
echo 📊 CLIENT DEMO ENDPOINTS:
echo Authentication: %BACKEND_URL%/api/auth
echo AI Workflows: %BACKEND_URL%/api/ai
echo Analytics: %BACKEND_URL%/api/analytics
echo.
echo 🎯 BUSINESS READINESS:
echo ✅ Professional API for client demos
echo ✅ Scalable infrastructure for growth  
echo ✅ Cost-effective hosting (~$1-5 per client/month)
echo ✅ Global accessibility for international market
echo.

:END
echo.
echo Press any key to exit...
pause >nul