# 🚀 Google Cloud Deployment Guide

This guide will help you deploy your LCC LMS whiteboard to Google Cloud Platform in minutes.

## Prerequisites

1. **Google Cloud Account** - Create one at https://cloud.google.com (includes $300 free credit)
2. **Google Cloud SDK** - Install from https://cloud.google.com/sdk/docs/install
3. **MongoDB Atlas** (already set up with your credentials)

## Quick Deployment Steps

### 1. Set up Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (replace with your desired project ID)
gcloud projects create your-project-id --name="LCC LMS"

# Set the project as active
gcloud config set project your-project-id

# Enable billing (required for Cloud Run)
# Visit: https://console.cloud.google.com/billing
```

### 2. Update Deployment Configuration

Edit `deploy-to-gcp.sh` and update these values:

```bash
PROJECT_ID="your-actual-gcp-project-id"  # The project ID you created
REGION="us-central1"                      # Or your preferred region
```

The MongoDB URI and JWT secret are already configured from your local setup.

### 3. Run Deployment

```bash
# Make the script executable
chmod +x deploy-to-gcp.sh

# Run the deployment
./deploy-to-gcp.sh
```

This will:
- Enable required Google Cloud APIs
- Store secrets in Secret Manager
- Build and deploy the backend to Cloud Run
- Build and deploy the frontend to Cloud Run
- Configure CORS automatically

### 4. Configure MongoDB Atlas

**IMPORTANT:** Allow Cloud Run to connect to your MongoDB:

1. Go to https://cloud.mongodb.com
2. Click **Network Access** → **Add IP Address**
3. Add **0.0.0.0/0** (allows all IPs) or specific Cloud Run IP ranges
4. Click **Confirm**

### 5. Test Your Deployment

After deployment completes, you'll see URLs like:
```
Frontend: https://lcclms-frontend-xxxxx-uc.a.run.app
Backend:  https://lcclms-backend-xxxxx-uc.a.run.app
```

Visit the frontend URL and test:
- ✅ Login/Registration
- ✅ Dashboard access
- ✅ Session scheduling
- ✅ Whiteboard collaboration

## Estimated Costs

**Free Tier Coverage:**
- Cloud Run: 2 million requests/month free
- Cloud Build: 120 build-minutes/day free
- Secret Manager: First 6 secrets free

**Expected Monthly Cost:** $0-10 for light usage (< 100 students)

## Optional: Custom Domain

### Set up a custom domain:

```bash
# Map your domain to the frontend
gcloud run services add-iam-policy-binding lcclms-frontend \
  --region=us-central1 \
  --member=allUsers \
  --role=roles/run.invoker

# Follow domain mapping guide:
# https://cloud.google.com/run/docs/mapping-custom-domains
```

### Example domains you could use:
- `whiteboard.yourdomain.com`
- `lcc.yourdomain.com`
- `tutor.yourdomain.com`

## Production Optimizations

### 1. Enable Cloud CDN (for faster global access)

```bash
# Deploy frontend to Cloud Storage + CDN instead
gsutil mb gs://your-bucket-name
cd frontend && npm run build
gsutil -m rsync -r dist gs://your-bucket-name
gsutil web set -m index.html -e index.html gs://your-bucket-name
```

### 2. Set up TURN Server (for WebRTC behind firewalls)

Use a service like:
- **Twilio TURN** - https://www.twilio.com/stun-turn
- **coturn on Compute Engine** - Self-hosted option
- **Xirsys** - https://xirsys.com/

Add to frontend `.env.production`:
```
VITE_TURN_URL=turn:your-turn-server.com:3478
VITE_TURN_USERNAME=your-username
VITE_TURN_CREDENTIAL=your-credential
```

### 3. Enable Monitoring

```bash
# Enable Cloud Monitoring
gcloud services enable monitoring.googleapis.com

# View logs
gcloud run logs read lcclms-backend --region=us-central1
gcloud run logs read lcclms-frontend --region=us-central1
```

### 4. Set up Backups

Your MongoDB Atlas already has automatic backups. To enable:
1. Go to MongoDB Atlas → Backup
2. Enable Continuous Backups

## Troubleshooting

### Backend won't start
```bash
# Check logs
gcloud run logs read lcclms-backend --region=us-central1 --limit=50

# Common issues:
# - MongoDB connection rejected → Check Network Access in Atlas
# - Port mismatch → Verify PORT env var is set to 4000
```

### Frontend can't reach backend
```bash
# Verify backend URL is correct
gcloud run services describe lcclms-backend --region=us-central1 --format='value(status.url)'

# Check frontend env vars
gcloud run services describe lcclms-frontend --region=us-central1 --format='value(spec.template.spec.containers[0].env)'
```

### WebRTC not working
- This is expected without a TURN server if users are behind strict firewalls
- Set up TURN server as described in "Production Optimizations"

## Updating Your Deployment

After making code changes:

```bash
# Re-run the deployment script
./deploy-to-gcp.sh
```

Or update individual services:

```bash
# Update backend only
cd backend
gcloud builds submit --tag gcr.io/your-project-id/lcclms-backend
gcloud run deploy lcclms-backend --image gcr.io/your-project-id/lcclms-backend --region=us-central1

# Update frontend only
cd frontend
gcloud builds submit --tag gcr.io/your-project-id/lcclms-frontend
gcloud run deploy lcclms-frontend --image gcr.io/your-project-id/lcclms-frontend --region=us-central1
```

## Support

If you encounter any issues:
1. Check the logs with `gcloud run logs read SERVICE_NAME`
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas allows connections from Cloud Run

---

**Need help?** The deployment script will show you the exact URLs after completion!

