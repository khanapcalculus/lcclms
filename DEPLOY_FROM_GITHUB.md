# 🚀 Deploy from GitHub to Google Cloud

This guide shows you how to set up **automatic deployment from your GitHub repository**.

## Benefits
- ✅ Push to GitHub → Automatically deploys to Google Cloud
- ✅ No need to install anything locally
- ✅ All done through web browsers
- ✅ Free with GitHub Actions (2,000 minutes/month)

## Setup Steps

### 1. Create Google Cloud Project

1. Go to: https://console.cloud.google.com
2. Click "Select a project" → "New Project"
3. Name: **LCC Whiteboard**
4. Note the **Project ID** (e.g., `lcc-whiteboard-123456`)

### 2. Enable Required APIs

In the Google Cloud Console:
1. Search for "Cloud Run API" → Enable
2. Search for "Cloud Build API" → Enable
3. Search for "Secret Manager API" → Enable
4. Search for "Artifact Registry API" → Enable

### 3. Create Service Account

1. Go to: **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Name: `github-actions`
4. Description: `Service account for GitHub Actions deployments`
5. Click **Create and Continue**
6. Add these roles:
   - **Cloud Run Admin**
   - **Cloud Build Editor**
   - **Secret Manager Secret Accessor**
   - **Service Account User**
   - **Storage Admin**
7. Click **Done**
8. Click on the service account you just created
9. Go to **Keys** tab → **Add Key** → **Create new key**
10. Choose **JSON** format
11. Click **Create** (a JSON file will download)
12. **Keep this file safe!**

### 4. Create Secrets in Google Cloud

In Google Cloud Console:
1. Go to **Secret Manager**
2. Click **Create Secret**:
   - Name: `mongodb-uri`
   - Secret value: `mongodb+srv://khanapcalculus:Thazhath12@cluster0.ipy6r.mongodb.net/lcclms?retryWrites=true&w=majority`
   - Click **Create**
3. Click **Create Secret** again:
   - Name: `jwt-secret`
   - Secret value: `abcdefghijklmnopqrstuvwxyz1234567890ABCDEF`
   - Click **Create**

### 5. Add Secrets to GitHub

1. Go to your GitHub repository: **https://github.com/khanapcalculus/lcclms**
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**:
   - Name: `GCP_PROJECT_ID`
   - Value: Your project ID (e.g., `lcc-whiteboard-123456`)
   - Click **Add secret**
4. Click **New repository secret** again:
   - Name: `GCP_SA_KEY`
   - Value: **Paste the entire contents** of the JSON file you downloaded in Step 3
   - Click **Add secret**

### 6. Configure MongoDB Atlas

**IMPORTANT:** Allow Google Cloud to connect:
1. Go to: https://cloud.mongodb.com
2. Click **Network Access**
3. Click **Add IP Address**
4. Click **Allow Access from Anywhere** (adds `0.0.0.0/0`)
5. Click **Confirm**

### 7. Push Code to GitHub

If you haven't committed the deployment files yet:

```bash
git add .
git commit -m "Add Google Cloud deployment configuration"
git push origin main
```

### 8. Watch the Deployment

1. Go to your GitHub repository: **https://github.com/khanapcalculus/lcclms**
2. Click **Actions** tab
3. You'll see the deployment running!
4. Wait 5-10 minutes for it to complete
5. When done, the logs will show your URLs:
   ```
   Frontend URL: https://lcclms-frontend-xxxxx.run.app
   Backend URL: https://lcclms-backend-xxxxx.run.app
   ```

### 9. Share with Students! 🎉

Give your students the **Frontend URL** and they can start using it immediately!

## Future Updates

Whenever you want to update your app:
1. Make changes to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Updated whiteboard feature"
   git push origin main
   ```
3. GitHub Actions will **automatically deploy** your changes!

## Manual Deployment Trigger

You can also manually trigger a deployment:
1. Go to **Actions** tab in GitHub
2. Click **Deploy to Google Cloud Run** workflow
3. Click **Run workflow** → **Run workflow**

## Cost Estimate

- **Cloud Run**: Free tier covers 2M requests/month
- **Cloud Build**: Free tier covers 120 build-minutes/day  
- **Secret Manager**: First 6 secrets free
- **GitHub Actions**: 2,000 minutes/month free

**Expected cost**: $0-10/month for typical usage

## Troubleshooting

### Deployment fails with "Permission denied"
- Make sure the service account has all required roles
- Verify the GCP_SA_KEY secret contains the full JSON

### Backend can't connect to MongoDB
- Check MongoDB Atlas Network Access allows `0.0.0.0/0`
- Verify the mongodb-uri secret is correct in Secret Manager

### Frontend shows "Failed to fetch"
- The backend URL is automatically configured
- Check that backend deployed successfully first
- Look at the GitHub Actions logs for any errors

## Getting Your URLs

After successful deployment, get your URLs:

```bash
# Install gcloud SDK (optional)
gcloud run services list --platform managed

# Or check in Google Cloud Console:
# Cloud Run → Services → Click on each service to see URL
```

---

**Need help?** Check the GitHub Actions logs for detailed error messages!

