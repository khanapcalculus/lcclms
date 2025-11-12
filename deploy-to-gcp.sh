#!/bin/bash

# Google Cloud deployment script for LCC LMS
# Run this after setting up your GCP project

set -e

echo "🚀 Deploying LCC LMS to Google Cloud..."

# Configuration - UPDATE THESE VALUES
PROJECT_ID="your-gcp-project-id"
REGION="us-central1"
MONGODB_URI="mongodb+srv://khanapcalculus:Thazhath12@cluster0.ipy6r.mongodb.net/lcclms?retryWrites=true&w=majority"
JWT_SECRET="abcdefghijklmnopqrstuvwxyz1234567890ABCDEF"

# Set the active project
gcloud config set project $PROJECT_ID

echo "✅ Project set to: $PROJECT_ID"

# Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com

echo "✅ APIs enabled"

# Create secrets in Secret Manager
echo "🔐 Creating secrets in Secret Manager..."
echo -n "$MONGODB_URI" | gcloud secrets create mongodb-uri --data-file=- --replication-policy=automatic || echo "Secret mongodb-uri already exists"
echo -n "$JWT_SECRET" | gcloud secrets create jwt-secret --data-file=- --replication-policy=automatic || echo "Secret jwt-secret already exists"

echo "✅ Secrets created"

# Build and deploy backend
echo "🏗️  Building and deploying backend to Cloud Run..."
cd backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/lcclms-backend
gcloud run deploy lcclms-backend \
  --image gcr.io/$PROJECT_ID/lcclms-backend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production" \
  --set-secrets "MONGODB_URI=mongodb-uri:latest,JWT_SECRET=jwt-secret:latest" \
  --port 4000 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0

BACKEND_URL=$(gcloud run services describe lcclms-backend --region $REGION --format 'value(status.url)')
echo "✅ Backend deployed at: $BACKEND_URL"

cd ..

# Update frontend environment variable
echo "🔧 Configuring frontend with backend URL..."
cd frontend
echo "VITE_API_BASE_URL=$BACKEND_URL" > .env.production

# Build and deploy frontend
echo "🏗️  Building and deploying frontend to Cloud Run..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/lcclms-frontend
gcloud run deploy lcclms-frontend \
  --image gcr.io/$PROJECT_ID/lcclms-frontend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0

FRONTEND_URL=$(gcloud run services describe lcclms-frontend --region $REGION --format 'value(status.url)')
echo "✅ Frontend deployed at: $FRONTEND_URL"

cd ..

# Update backend CORS to allow frontend domain
echo "🔧 Updating backend CORS settings..."
gcloud run services update lcclms-backend \
  --region $REGION \
  --update-env-vars "CLIENT_ORIGIN=$FRONTEND_URL"

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL:  $BACKEND_URL"
echo ""
echo "⚠️  IMPORTANT: Update MongoDB Atlas Network Access to allow connections from Google Cloud"
echo "    Go to: https://cloud.mongodb.com/ → Network Access → Add IP Address → Add '0.0.0.0/0' (or specific Cloud Run IPs)"
echo ""
echo "📝 Next steps:"
echo "   1. Test your deployment by visiting: $FRONTEND_URL"
echo "   2. Set up a custom domain (optional): https://cloud.google.com/run/docs/mapping-custom-domains"
echo "   3. Configure TURN server for WebRTC (optional for production)"
echo ""

