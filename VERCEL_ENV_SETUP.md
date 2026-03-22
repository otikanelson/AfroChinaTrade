# Vercel Environment Variables Setup

The backend is deployed but failing because environment variables aren't configured. Follow these steps:

## 1. Go to Vercel Dashboard

1. Visit https://vercel.com/dashboard
2. Click on your `afro-china-trade` project
3. Go to **Settings** → **Environment Variables**

## 2. Add These Environment Variables

Copy the values from your local `backend/.env.local` or `backend/.env.production`:

### Required Variables

| Variable | Value | Source |
|----------|-------|--------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | MongoDB Atlas → Connect → Connection String |
| `JWT_SECRET` | A strong random 32+ character string | Generate with: `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | `7d` | Fixed value |
| `NODE_ENV` | `production` | Fixed value |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | Cloudinary Dashboard |
| `ALLOWED_ORIGINS` | `https://afro-china-trade.vercel.app,http://localhost:3000,http://localhost:8081,http://localhost:19000` | Fixed value |
| `UPLOAD_DIR` | `uploads` | Fixed value |
| `MAX_FILE_SIZE` | `5242880` | Fixed value |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Fixed value |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Fixed value |

## 3. Redeploy

After adding all variables:
1. Go to **Deployments**
2. Find the latest deployment
3. Click the three dots menu
4. Select **Redeploy**

## 4. Verify

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

## Troubleshooting

If it still fails:
1. Check **Deployments** → Click deployment → **Logs** tab
2. Look for errors about:
   - `MONGODB_URI environment variable is not defined`
   - Database connection timeouts
   - JWT_SECRET missing

## Important Notes

- Never commit `.env` files to GitHub
- Keep `.env.local` and `.env.production` in `.gitignore`
- Rotate credentials if they're ever exposed
- Use strong, unique JWT_SECRET for production
