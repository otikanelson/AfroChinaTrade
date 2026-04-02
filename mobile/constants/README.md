# Configuration Setup

## Initial Setup

1. Copy `config.example.ts` to `config.ts`:
   ```bash
   cp config.example.ts config.ts
   ```

2. Update `config.ts` with your actual Vercel URL:
   ```typescript
   export const VERCEL_API_URL = 'https://your-actual-app.vercel.app/api';
   ```

3. Configure your `.env.local` file in the mobile directory:
   ```env
   EXPO_PUBLIC_API_URL=https://your-actual-app.vercel.app/api
   EXPO_PUBLIC_FALLBACK_API_URL=http://YOUR_LOCAL_IP:3000/api
   EXPO_PUBLIC_ENV=development
   EXPO_PUBLIC_DEBUG=true
   ```

## Security Note

- `config.ts` is gitignored to keep your URLs private
- Never commit `config.ts` to version control
- Always use `config.example.ts` as a template for new setups
- The actual URLs are loaded from environment variables when possible
