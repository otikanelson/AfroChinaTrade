# AfroChinaTrade - Setup Guide

This guide will help you set up the AfroChinaTrade application from a fresh clone.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** (for cloning the repository)

### Optional (for mobile development):
- **Expo CLI** - Will be installed with mobile dependencies
- **Android Studio** or **Xcode** (for mobile app testing)

---

## Project Structure

This is a monorepo containing:

```
AfroChinaTrade/
├── backend/          # Express.js + TypeScript API
├── mobile/           # React Native + Expo mobile app
├── admin/            # React admin dashboard
├── web/              # Web frontend
├── shared/           # Shared types and utilities
└── package.json      # Root workspace configuration
```

---

## Setup Instructions

### 1. Install Dependencies

From the root directory, install all dependencies for all workspaces:

```bash
npm install
```

This will install dependencies for:
- Root workspace
- Mobile app
- Admin dashboard
- Shared packages
- Backend (manual installation needed)

Then install backend dependencies separately:

```bash
cd backend
npm install
cd ..
```

---

### 2. Configure Backend Environment

Create the backend environment file:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and configure the following **required** variables:

#### MongoDB Configuration
```env
MONGODB_URI=mongodb://localhost:27017/afrochinatrade
```
> **Note**: Make sure MongoDB is running locally or use a cloud MongoDB URI (e.g., MongoDB Atlas)

#### JWT Secret
Generate a secure JWT secret (at least 32 characters):
```bash
# On Windows PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Or use an online generator: https://randomkeygen.com/
```

Update the JWT_SECRET in your `.env` file with the generated value.

#### Cloudinary Configuration
Sign up for a free account at [Cloudinary](https://cloudinary.com/) and get your credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

### 3. Configure Mobile App Environment

Create the mobile environment file:

```bash
cd mobile
cp .env.example .env.local
```

Edit `mobile/.env.local`:

**For local development:**
```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3001/api
EXPO_PUBLIC_FALLBACK_API_URL=https://afro-china-trade.vercel.app/api
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_DEBUG=true
```

> **Important**: Replace `YOUR_LOCAL_IP` with your computer's local IP address (e.g., 192.168.1.100)
> Find your IP with: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

**For production testing:**
```env
EXPO_PUBLIC_API_URL=https://afro-china-trade.vercel.app/api
EXPO_PUBLIC_FALLBACK_API_URL=https://afro-china-trade.vercel.app/api
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_DEBUG=false
```

---

### 4. Start MongoDB

Make sure MongoDB is running:

**Windows:**
```bash
# If installed as a service, it should start automatically
# To start manually:
net start MongoDB

# Or run mongod directly:
mongod --dbpath C:\data\db
```

**Mac/Linux:**
```bash
# Using Homebrew:
brew services start mongodb-community

# Or run manually:
mongod --dbpath /usr/local/var/mongodb
```

---

### 5. Seed the Database (Optional but Recommended)

The backend includes scripts to populate the database with sample data:

```bash
cd backend

# Seed everything (categories, products, users, etc.)
npm run db:seed

# Or seed individually:
npm run db:seed:categories       # Product categories
npm run db:seed:admin            # Admin user
npm run db:seed:sample           # Sample products and data
```

---

### 6. Start the Applications

#### Start Backend API

```bash
cd backend
npm run dev
```

The API will be available at: `http://localhost:3001`

#### Start Mobile App

In a new terminal:

```bash
cd mobile
npm start
```

This will start Expo. You can then:
- Press `a` for Android emulator
- Press `i` for iOS simulator (Mac only)
- Scan QR code with Expo Go app on your phone

#### Start Admin Dashboard

In a new terminal:

```bash
cd admin
npm run dev
```

The admin dashboard will be available at: `http://localhost:5173`

#### Start Web Frontend

In a new terminal:

```bash
cd web
npm run dev
```

---

## Testing the Setup

### 1. Test Backend Health

Visit or curl:
```bash
curl http://localhost:3001/api/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

### 2. Test Admin Login

If you seeded the database, use these credentials:
- **Email**: `admin@afrochinatrade.com`
- **Password**: Check the seed script or create a new admin user

### 3. Test Mobile App

- Launch the mobile app
- Try browsing products
- Test user registration/login

---

## Common Issues & Troubleshooting

### MongoDB Connection Error

**Error**: `MongoServerError: connect ECONNREFUSED`

**Solution**:
- Make sure MongoDB is running: `net start MongoDB` (Windows)
- Check your MONGODB_URI in `backend/.env`
- Try connecting with: `mongodb://127.0.0.1:27017/afrochinatrade`

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3001`

**Solution**:
- Change the PORT in `backend/.env`
- Or kill the process using the port:
  ```bash
  # Windows:
  netstat -ano | findstr :3001
  taskkill /PID <PID> /F
  ```

### Mobile App Can't Connect to Backend

**Error**: Network request failed / Cannot connect to server

**Solution**:
- Make sure you're using your **local IP address**, not `localhost`
- Check that your phone and computer are on the **same Wi-Fi network**
- Ensure Windows Firewall allows Node.js connections
- Update `EXPO_PUBLIC_API_URL` in `mobile/.env.local`

### JWT Secret Error

**Error**: `JWT_SECRET must be at least 32 characters long`

**Solution**:
- Generate a longer secret key (see step 2 above)
- Make sure it's not the default example value

### Cloudinary Upload Error

**Error**: `Invalid API key` or `Upload failed`

**Solution**:
- Verify your Cloudinary credentials in `backend/.env`
- Sign up at [cloudinary.com](https://cloudinary.com) if you haven't
- Check that all three values are set correctly

---

## Development Workflow

### Backend Development

```bash
cd backend
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm run start        # Start production server
npm test             # Run tests
```

### Database Management

```bash
npm run db:seed              # Seed all data
npm run db:clear             # Clear database (with confirmation)
npm run db:health            # Check database connection
npm run db:verify            # Verify indexes
```

### Mobile Development

```bash
cd mobile
npm start            # Start Expo
npm run android      # Run on Android
npm run ios          # Run on iOS (Mac only)
npm test             # Run tests
```

### Admin Development

```bash
cd admin
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
```

---

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | No | Environment mode | `development` |
| `PORT` | No | Server port | `3001` |
| `MONGODB_URI` | **Yes** | MongoDB connection string | `mongodb://localhost:27017/afrochinatrade` |
| `JWT_SECRET` | **Yes** | JWT signing key (32+ chars) | `your-secure-secret-key...` |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | **Yes** | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | **Yes** | Cloudinary API secret | `abcdefghijklmnopqrstuvwxyz` |

### Mobile (.env.local)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | **Yes** | Primary API endpoint | `http://192.168.1.100:3001/api` |
| `EXPO_PUBLIC_FALLBACK_API_URL` | **Yes** | Fallback API endpoint | `https://afro-china-trade.vercel.app/api` |
| `EXPO_PUBLIC_ENV` | No | Environment | `development` |
| `EXPO_PUBLIC_DEBUG` | No | Debug mode | `true` |

---

## Next Steps

1. **Review the documentation**:
   - `BUSINESS_OVERVIEW.md` - Business model and vision
   - `backend/README.md` - Backend API documentation
   - `admin/README.md` - Admin dashboard guide

2. **Explore the codebase**:
   - Backend controllers in `backend/src/controllers/`
   - Mobile screens in `mobile/src/screens/`
   - Admin pages in `admin/src/pages/`

3. **Start developing**:
   - Add new features
   - Fix bugs
   - Improve UI/UX
   - Write tests

---

## Support

For questions or issues:
- Check existing documentation
- Review error logs in the console
- Ensure all prerequisites are properly installed
- Verify environment variables are correctly configured

---

**Happy Coding! 🚀**
