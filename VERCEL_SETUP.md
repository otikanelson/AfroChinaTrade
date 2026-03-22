# Vercel Backend Setup Guide

Your backend is deployed to Vercel but login is failing because environment variables aren't configured. Follow these steps:

## 1. Go to Vercel Dashboard

1. Visit https://vercel.com/dashboard
2. Select your `afro-china-trade` project
3. Go to **Settings** → **Environment Variables**

## 2. Add Required Environment Variables

Add these variables (get actual values from your local `.env.local`):

### Database
- **MONGODB_URI**: Your MongoDB Atlas connection string
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/afrochinatrade?retryWrites=true&w=majority`

### JWT
- **JWT_SECRET**: Generate a strong random key (minimum 32 characters)
  - Run: `openssl rand -base64 32`
- **JWT_EXPIRES_IN**: `7d`

### Cloudinary (for image uploads)
- **CLOUDINARY_CLOUD_NAME**: `dqwa8w9wb`
- **CLOUDINARY_API_KEY**: `549813351582393`
- **CLOUDINARY_API_SECRET**: `fJ7vajUs2OXUuguNpX3U69F2f34`

### CORS
- **ALLOWED_ORIGINS**: `https://afro-china-trade.vercel.app,http://localhost:3000,http://localhost:8081,http://localhost:19000`

### Rate Limiting
- **RATE_LIMIT_WINDOW_MS**: `900000`
- **RATE_LIMIT_MAX_REQUESTS**: `100`

### Node Environment
- **NODE_ENV**: `production`

## 3. Redeploy

After adding environment variables:
1. Go to **Deployments**
2. Click the three dots on the latest deployment
3. Select **Redeploy**

## 4. Test Login

Once redeployed, try logging in again from the EAS preview build.

## Troubleshooting

If login still fails:
1. Check Vercel logs: **Deployments** → Click deployment → **Logs**
2. Look for errors related to:
   - Database connection
   - JWT secret
   - Password validation
   - CORS issues

## Local Testing

To test locally before deploying:
```bash
cd backend
npm run build
npm start
```

Then test the `/api/health` endpoint:
```bash
curl http://localhost:3000/api/health
```
