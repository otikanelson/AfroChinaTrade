# Manual Vercel Environment Variables Setup

Vercel does NOT automatically load `.env.production` files. You must set environment variables in the Vercel dashboard.

## Steps to Configure

1. Go to https://vercel.com/dashboard
2. Click on your `afro-china-trade` project
3. Go to **Settings** → **Environment Variables**
4. Add each variable below:

## Required Environment Variables

Copy these exact values:

```
MONGODB_URI=mongodb+srv://Nelson:NELSON2005@ac-e3a4d1f-shard-00-00.pg9c7ou.mongodb.net/afrochinatrade?retryWrites=true&w=majority

JWT_SECRET=prod-secret-key-change-this-to-something-secure-32chars

JWT_EXPIRES_IN=7d

NODE_ENV=production

CLOUDINARY_CLOUD_NAME=dqwa8w9wb

CLOUDINARY_API_KEY=549813351582393

CLOUDINARY_API_SECRET=fJ7vajUs2OXUuguNpX3U69F2f34

ALLOWED_ORIGINS=https://afro-china-trade.vercel.app,http://localhost:8081,http://localhost:19000,http://localhost:3000

UPLOAD_DIR=uploads

MAX_FILE_SIZE=5242880

RATE_LIMIT_WINDOW_MS=900000

RATE_LIMIT_MAX_REQUESTS=100
```

## After Adding Variables

1. Go to **Deployments**
2. Find the latest deployment
3. Click the three dots menu
4. Select **Redeploy**

## Verify

Test the health endpoint:
```bash
curl https://afro-china-trade.vercel.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Server is running",
  "database": "connected"
}
```

## Why This is Needed

- `.env.production` is a local file and is NOT sent to Vercel
- Vercel only uses environment variables set in the dashboard
- This is a security best practice - secrets are never committed to git
