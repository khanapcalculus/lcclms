@echo off
echo ========================================
echo Deploying to Google Cloud
echo ========================================
echo.
echo Step 1: Building and deploying BACKEND...
echo.
gcloud builds submit --config=backend/cloudbuild.yaml --project=fourth-cedar-477914-i5
echo.
echo ========================================
echo Step 2: Building and deploying FRONTEND...
echo.
gcloud builds submit --config=frontend/cloudbuild.yaml --project=fourth-cedar-477914-i5
echo.
echo ========================================
echo Deployment complete!
echo.
echo Backend: https://lcclms-19941050683.us-central1.run.app
echo Frontend: https://lcc360-19941050683.us-central1.run.app
echo.
echo Please test on your tablet now!
echo ========================================
pause


