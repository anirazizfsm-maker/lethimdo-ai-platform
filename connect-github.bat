@echo off
echo ================================
echo   GITHUB CONNECTION SETUP
echo   Bangladesh Freelance Agency
echo ================================
echo.

set /p GITHUB_USERNAME="Enter your GitHub username: "
set /p REPO_NAME="Enter repository name (default: lethimdo-ai-platform): "

if "%REPO_NAME%"=="" set REPO_NAME=lethimdo-ai-platform

echo.
echo Connecting to: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git
echo.

echo [1/4] Adding GitHub remote...
git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git

echo [2/4] Renaming branch to main...
git branch -M main

echo [3/4] Replacing README with professional version...
copy "README-PROFESSIONAL.md" "README.md"
git add README.md
git commit -m "Add professional README for international clients"

echo [4/4] Pushing to GitHub...
git push -u origin main

echo.
echo ================================
echo   SUCCESS! Repository Connected
echo ================================
echo.
echo Your repository is now live at:
echo https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo.
echo Next steps for your freelance agency:
echo 1. Deploy to Vercel (frontend)
echo 2. Deploy to Railway (backend)  
echo 3. Add live demo links to repository
echo 4. Start showcasing to international clients
echo.
echo Repository features perfect for client acquisition:
echo ✅ Professional README with Bangladesh team highlight
echo ✅ Complete documentation and legal compliance
echo ✅ Enterprise-ready technology stack showcase
echo ✅ Cost-effective positioning for USD clients
echo.
pause