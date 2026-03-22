# Vercel Deployment Guide

## Backend Deployment to Vercel

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- Git repository pushed to GitHub, GitLab, or Bitbucket
- All environment variables configured

### Step 1: Prepare Backend for Deployment

✅ **Already Done:**
- Created `backend/vercel.json` configuration file
- Backend has proper build and start scripts in `package.json`
- TypeScript compilation configured in `tsconfig.json`

### Step 2: Deploy Backend to Vercel

1. **Connect your repository to Vercel:**
   - Go to https://vercel.com/new
   - Select your Git provider (GitHub, GitLab, or Bitbucket)
   - Import your repository

2. **Configure the deployment:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Start Command:** `node dist/index.js`

3. **Set Environment Variables in Vercel:**
   - Go to your project settings → Environment Variables
   - Add all variables from `backend/.env.example`:
     - `MONGODB_URI` - Your MongoDB Atlas connection string
     - `JWT_SECRET` - Generate a strong random secret (minimum 32 chars)
     - `JWT_EXPIRES_IN` - `7d`
     - `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
     - `CLOUDINARY_API_KEY` - Your Cloudinary API key
     - `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
     - `ALLOWED_ORIGINS` - Add your Vercel URL and mobile app URLs
     - `RATE_LIMIT_WINDOW_MS` - `900000`
     - `RATE_LIMIT_MAX_REQUESTS` - `100`
     - `NODE_ENV` - `production`
     - `PORT` - `3000` (Vercel will override this)

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - You'll get a URL like: `https://your-project-name.vercel.app`

### Step 3: Update Mobile App Configuration

Once you have your Vercel deployment URL:

1. Open `mobile/constants/config.ts`
2. Replace the placeholder URL:
   ```typescript
   const PRODUCTION_URL = 'https://your-vercel-deployment.vercel.app/api';
   ```
   with your actual Vercel URL

3. The mobile app will now use the cloud backend

### Step 4: Build and Deploy Mobile App with EAS

After updating the config, build your mobile app:

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Or build for both
eas build --platform all
```

The EAS builds will now use your cloud backend instead of localhost.

### Step 5: Verify Deployment

Test your backend:
```bash
curl https://your-vercel-deployment.vercel.app/api/health
```

You should get a response like:
```json
{
  "status": "ok",
  "message": "Server is running",
  "database": "connected"
}
```

### Troubleshooting

**Build fails with "Cannot find module":**
- Ensure all dependencies are in `package.json` (not just devDependencies)
- Check that `tsconfig.json` is properly configured

**Database connection fails:**
- Verify `MONGODB_URI` is correct in Vercel environment variables
- Check that your MongoDB Atlas IP whitelist includes Vercel's IPs (or allow all: 0.0.0.0/0)

**CORS errors in mobile app:**
- Add your mobile app's origin to `ALLOWED_ORIGINS` in environment variables
- For EAS builds, you may need to add the EAS domain

**Environment variables not loading:**
- Ensure variables are set in Vercel project settings
- Redeploy after adding/changing environment variables

### Important Notes

- The `vercel.json` file is already configured to handle all routes
- Vercel automatically handles HTTPS
- Your MongoDB connection must be accessible from Vercel (use MongoDB Atlas)
- Keep sensitive data (JWT_SECRET, API keys) in Vercel environment variables, never in code
