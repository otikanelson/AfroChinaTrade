# Environment Setup Guide

## 🔒 Secure Configuration Approach

All URLs and sensitive configuration are kept out of the repository. The app relies entirely on environment variables.

## Quick Setup

### 1. For Local Development (Expo Go)

1. **Create your local environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Find your computer's IP address:**
   - **Windows**: `ipconfig` (look for IPv4 Address)
   - **Mac/Linux**: `ifconfig` or `ip addr show`

3. **Edit `.env.local` with your actual values:**
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.XXX:3000/api
   EXPO_PUBLIC_ENV=development
   EXPO_PUBLIC_DEBUG=true
   ```

4. **Start development:**
   ```bash
   npx expo start
   ```

### 2. For EAS Builds (APK/Production)

**No local setup needed!** The production URL is configured in `eas.json` for builds.

```bash
# Build preview APK
npx eas build --platform android --profile preview

# Build production APK  
npx eas build --platform android --profile production
```

## 📁 File Structure

```
mobile/
├── .env.example          # Template file (committed)
├── .env.local           # Your local config (NOT committed)
├── eas.json             # EAS build config with production URL
└── constants/config.ts  # No hardcoded URLs (safe to commit)
```

## 🔍 Environment Detection

The app automatically detects the environment:

- **Expo Go**: Uses `.env.local` → Development mode
- **EAS Build**: Uses `eas.json` environment variables → Production mode

## 🛡️ Security Benefits

- ✅ No sensitive URLs in git history
- ✅ Each developer can use their own IP
- ✅ Production URLs only in EAS configuration
- ✅ No accidental commits of local IPs
- ✅ Clean separation of environments

## 🚨 Troubleshooting

### "Missing EXPO_PUBLIC_API_URL" Error

**In Development:**
1. Make sure `.env.local` exists
2. Check that `EXPO_PUBLIC_API_URL` is set correctly
3. Restart Expo development server

**In Production:**
This shouldn't happen as EAS builds include the URL automatically.

### Connection Issues

**Development:**
- Ensure backend server is running on the specified port
- Check that device and computer are on same WiFi network
- Verify IP address is correct in `.env.local`

**Production:**
- Wait 10-15 seconds for Vercel cold start
- Check internet connection

## 📋 Environment Variables Reference

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `EXPO_PUBLIC_API_URL` | Your local IP:port | Vercel URL | API base URL |
| `EXPO_PUBLIC_ENV` | `development` | `production` | Environment mode |
| `EXPO_PUBLIC_DEBUG` | `true` | `false` | Enable debug logs |

## 🔄 Switching Environments

The app automatically switches based on how it's running:

- **`npx expo start`** → Development (uses `.env.local`)
- **EAS Build** → Production (uses `eas.json` config)

No manual switching needed!