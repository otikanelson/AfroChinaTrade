# 🌍 AfroChinaTrade

### *Bridging Africa and China Through Secure Wholesale Trading*

A comprehensive e-commerce platform connecting African dealers with Chinese manufacturers, featuring direct factory connections, transparent pricing, and integrated logistics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D6.0-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)

---

## 🌟 What is AfroChinaTrade?

AfroChinaTrade is a **digital wholesale trading platform** that revolutionizes commerce between Africa and China by providing:

- 🏭 **Direct Factory Connections** - Connect directly with Chinese manufacturers
- 💰 **Transparent Pricing** - No hidden markups or middlemen fees
- 🚢 **Integrated Logistics** - Seamless shipping and customs handling
- 🔒 **Secure Payments** - Protected transactions and cargo handling
- 📱 **Mobile-First Experience** - Beautiful iOS & Android apps
- 🎯 **End-to-End Facilitation** - From order to delivery, we've got you covered

### Business Model

AfroChinaTrade operates as a B2B wholesale marketplace enabling:
- African businesses to source quality products directly from China
- Chinese manufacturers to reach African markets efficiently
- Transparent, secure transactions with built-in logistics support

For detailed business information, see [BUSINESS_OVERVIEW.md](BUSINESS_OVERVIEW.md)

---

## 🏗️ Project Architecture

This is a **full-stack monorepo** with multiple interconnected applications:

```
AfroChinaTrade/
│
├── 📱 mobile/                    # React Native + Expo Mobile App
│   ├── screens/                  # App screens (Home, Products, Cart, etc.)
│   ├── components/               # Reusable UI components
│   ├── navigation/               # Navigation structure
│   ├── services/                 # API integration
│   └── utils/                    # Helper functions
│   └── 🚀 iOS & Android apps
│
├── 🖥️ backend/                   # Express.js + TypeScript API Server
│   ├── controllers/              # Business logic handlers
│   ├── models/                   # MongoDB schemas (User, Product, Order, etc.)
│   ├── routes/                   # API endpoints
│   ├── middleware/               # Authentication, validation, etc.
│   ├── services/                 # External integrations
│   ├── scripts/                  # Database seeding & maintenance
│   └── 🔌 RESTful API on port 3001
│
├── 👨‍💼 admin/                     # React Admin Dashboard
│   ├── pages/                    # Dashboard pages
│   ├── components/               # Admin UI components
│   ├── services/                 # API client
│   └── 📊 Admin panel on port 5173
│
├── 🌐 web/                       # Web Frontend (Future)
│   └── Public-facing website
│
├── 📦 shared/                    # Shared TypeScript Types
│   └── Common types used across projects
│
└── 📄 Root configuration files
```

### Technology Stack

| Component | Technologies |
|-----------|--------------|
| **Mobile App** | React Native, Expo, TypeScript, AsyncStorage |
| **Backend API** | Express.js, TypeScript, MongoDB, Mongoose, JWT |
| **Admin Panel** | React, TypeScript, Vite, TailwindCSS, Zustand |
| **Database** | MongoDB with Mongoose ODM |
| **Storage** | Cloudinary (images), MongoDB (data) |
| **Deployment** | Vercel (Backend & Admin), Expo (Mobile) |

---

## 🚀 Quick Start Guide

### Prerequisites Checklist

Ensure you have these installed:

- ✅ **Node.js** v18+ → [Download](https://nodejs.org/)
- ✅ **MongoDB** v6+ → [Download](https://www.mongodb.com/try/download/community)
- ✅ **npm** v8+ (bundled with Node.js)
- ✅ **Git** → [Download](https://git-scm.com/)

**Optional but recommended:**
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Quick Verification

```bash
node --version    # Should show v18 or higher
npm --version     # Should show v8 or higher
mongod --version  # Should show v6 or higher
```

---

### 🎯 Installation (Choose Your Method)

#### Option A: Automated Setup (Windows - Recommended)

```powershell
# Clone the repository
git clone https://github.com/yourusername/AfroChinaTrade.git
cd AfroChinaTrade

# Run automated setup
.\setup.ps1
```

This will:
- Install all dependencies for backend, mobile, and admin
- Create necessary `.env` files
- Verify your environment
- Guide you through configuration

#### Option B: Manual Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/AfroChinaTrade.git
cd AfroChinaTrade

# 2. Install root dependencies
npm install

# 3. Install backend dependencies
cd backend
npm install
cd ..

# 4. Install mobile dependencies
cd mobile
npm install
cd ..

# 5. Install admin dependencies
cd admin
npm install
cd ..

# 6. Setup environment files
# Windows:
copy backend\.env.example backend\.env
copy mobile\.env.example mobile\.env.local

# Mac/Linux:
cp backend/.env.example backend/.env
cp mobile/.env.example mobile/.env.local
```

---

### ⚙️ Configuration

#### 1. Backend Configuration (`backend/.env`)

Open `backend/.env` and configure:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/afrochinatrade

# JWT Secret (IMPORTANT: Change this!)
JWT_SECRET=your-very-secure-secret-key-minimum-32-characters-long

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Port
PORT=3001
```

#### 2. Mobile Configuration (`mobile/.env.local`)

Find your local IP address:

```bash
# Windows
ipconfig
# Look for "IPv4 Address" under your active network adapter

# Mac/Linux
ifconfig
# Look for "inet" under your active network adapter
```

Then configure `mobile/.env.local`:

```env
# Use your actual local IP address, NOT localhost!
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:3001/api
EXPO_PUBLIC_FALLBACK_API_URL=http://192.168.1.XXX:3001/api
EXPO_PUBLIC_ENV=development
```

⚠️ **Important:** Use your **local IP address** (e.g., 192.168.1.5), not `localhost` or `127.0.0.1`

For detailed configuration help, see [SETUP.md](SETUP.md)

---

### 🎬 Running the Application

#### Step 1: Start MongoDB

```bash
# Windows
net start MongoDB

# Mac (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### Step 2: Seed the Database (First Time Only)

```bash
cd backend

# Create admin user
npm run db:seed:admin

# Seed sample data (optional)
npm run db:seed

cd ..
```

**Default Admin Credentials:**
- Email: `admin@afrochinatrade.com`
- Password: `Admin123!@#`

#### Step 3: Start All Services

Open **3 separate terminals**:

**Terminal 1 - Backend API:**
```bash
cd backend
npm run dev
```
✅ Backend running at `http://localhost:3001`

**Terminal 2 - Mobile App:**
```bash
cd mobile
npm start
```
✅ Scan QR code with Expo Go app or press `a` for Android, `i` for iOS

**Terminal 3 - Admin Dashboard:**
```bash
cd admin
npm run dev
```
✅ Admin panel at `http://localhost:5173`

---

### 🎉 You're All Set!

**Access your applications:**

- 📱 **Mobile App:** Scan QR code in Expo Go
- 👨‍💼 **Admin Panel:** http://localhost:5173
- 🔌 **API Docs:** http://localhost:3001/api

**Test the admin login:**
1. Go to http://localhost:5173
2. Email: `admin@afrochinatrade.com`
3. Password: `Admin123!@#`

For detailed guides, see:
- [QUICK_START.md](QUICK_START.md) - Comprehensive startup guide
- [SETUP.md](SETUP.md) - Detailed configuration
- [backend/README.md](backend/README.md) - Backend documentation
- [admin/README.md](admin/README.md) - Admin panel documentation

---

## 📱 Applications

### Backend API

- **Tech**: Express.js, TypeScript, MongoDB, Mongoose
- **Port**: 3001 (default)
- **Features**:
  - RESTful API
  - JWT authentication
  - Image upload (Cloudinary)
  - Rate limiting
  - Input validation
  - Security middleware

### Mobile App

- **Tech**: React Native, Expo, TypeScript
- **Platform**: iOS & Android
- **Features**:
  - Product browsing and search
  - Shopping cart
  - Order management
  - User authentication
  - Push notifications
  - Real-time updates

### Admin Dashboard

- **Tech**: React, TypeScript, Vite, TailwindCSS
- **Port**: 5173 (default)
- **Features**:
  - Product management
  - Order tracking
  - User management
  - Analytics dashboard
  - Category management
  - Review moderation

---

## ✨ Key Features

### 🛍️ For Buyers (Dealers & Retailers)

<table>
<tr>
<td width="50%">

**Shopping Experience**
- ✅ Browse 1000s of wholesale products
- ✅ Advanced search and filtering
- ✅ Category-based navigation
- ✅ Product recommendations
- ✅ Featured and trending items
- ✅ Price comparison tools

</td>
<td width="50%">

**Order Management**
- ✅ Secure checkout process
- ✅ Multiple delivery addresses
- ✅ Real-time order tracking
- ✅ Order history and receipts
- ✅ Refund request system
- ✅ Bulk ordering support

</td>
</tr>
<tr>
<td>

**User Experience**
- ✅ Beautiful mobile apps (iOS & Android)
- ✅ Wishlist and favorites
- ✅ Product reviews and ratings
- ✅ In-app messaging
- ✅ Push notifications
- ✅ Multi-language support (coming soon)

</td>
<td>

**Account Features**
- ✅ Secure authentication (JWT)
- ✅ Profile customization
- ✅ Address book management
- ✅ Order history & analytics
- ✅ Notification preferences
- ✅ Password recovery

</td>
</tr>
</table>

### 🏪 For Sellers (Manufacturers & Suppliers)

- ✅ Product listing and catalog management
- ✅ Inventory tracking and stock alerts
- ✅ Order fulfillment dashboard
- ✅ Sales analytics and insights
- ✅ Customer communication tools
- ✅ Pricing and discount management
- ✅ Performance metrics

### 👨‍💼 For Administrators

<table>
<tr>
<td width="50%">

**Content Management**
- ✅ Product moderation
- ✅ Category & subcategory management
- ✅ Collection curation
- ✅ Review moderation
- ✅ Featured product selection
- ✅ Banner and ad management

</td>
<td width="50%">

**User Management**
- ✅ User account oversight
- ✅ Role-based access control
- ✅ Suspension & ban system
- ✅ Activity monitoring
- ✅ Support ticket system
- ✅ User analytics

</td>
</tr>
<tr>
<td>

**Order Operations**
- ✅ Order monitoring & tracking
- ✅ Status updates
- ✅ Refund processing
- ✅ Dispute resolution
- ✅ Shipping coordination
- ✅ Payment verification

</td>
<td>

**Analytics & Reports**
- ✅ Real-time dashboard
- ✅ Sales and revenue reports
- ✅ User engagement metrics
- ✅ Product performance analysis
- ✅ Conversion tracking
- ✅ Custom report generation

</td>
</tr>
</table>

---

## 🛠️ Development Scripts

### Backend Commands

```bash
cd backend

# Development
npm run dev              # Start with hot reload (ts-node-dev)
npm run dev:prod         # Start in production mode
npm run build            # Compile TypeScript to JavaScript
npm start                # Run compiled production code

# Database Operations
npm run db:seed          # Seed all data
npm run db:seed:admin    # Create admin user
npm run db:seed:sample   # Seed sample products
npm run db:clear         # Clear database (with prompt)
npm run db:health        # Check MongoDB connection
npm run db:verify        # Verify database indexes
npm run db:sync:reviews  # Sync product review counts

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

### Mobile App Commands

```bash
cd mobile

# Development
npm start                # Start Expo dev server
npm run android          # Launch on Android device/emulator
npm run ios              # Launch on iOS simulator (Mac only)
npm run web              # Launch in web browser

# Build & Deploy
eas build --platform android  # Build Android APK
eas build --platform ios      # Build iOS IPA
eas submit                    # Submit to app stores

# Quality Assurance
npm test                 # Run tests
npm run lint             # Lint code with ESLint
npm run type-check       # Check TypeScript types
```

### Admin Dashboard Commands

```bash
cd admin

# Development
npm run dev              # Start Vite dev server (hot reload)
npm run build            # Build for production
npm run preview          # Preview production build locally

# Quality Assurance
npm run lint             # Lint code with ESLint
npm run type-check       # Check TypeScript types
npm run format           # Format code with Prettier
```

### Root Commands

```bash
# From project root

# Install all dependencies
npm install

# Clean all node_modules
npm run clean

# Reinstall everything fresh
npm run reinstall
```

---

## 📊 Database Seeding

Populate your database with sample data:

```bash
cd backend

# Seed everything
npm run db:seed

# Or seed individually:
npm run db:seed:categories      # Product categories
npm run db:seed:admin           # Admin user
npm run db:seed:sample          # Sample products
npm run db:seed:collections     # Product collections
```

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing (bcrypt)
- Input validation and sanitization
- MongoDB injection protection
- Rate limiting
- CORS configuration
- Helmet security headers
- Secure file uploads

---

## 🌐 API Documentation

### Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://afro-china-trade.vercel.app/api`

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/auth/register` | POST | User registration |
| `/auth/login` | POST | User login |
| `/products` | GET | List products |
| `/products/:id` | GET | Get product details |
| `/cart` | GET | Get user cart |
| `/orders` | POST | Create order |

See individual controller files for complete API documentation.

---

## 📁 Environment Variables

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing key (32+ chars) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | Environment mode |

### Mobile

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Yes | Primary API endpoint |
| `EXPO_PUBLIC_FALLBACK_API_URL` | Yes | Fallback API endpoint |
| `EXPO_PUBLIC_ENV` | No | Environment mode |
| `EXPO_PUBLIC_DEBUG` | No | Debug mode |

---

## 🐛 Common Issues & Solutions

### 🔴 MongoDB Connection Failed

**Problem:** `MongooseError: Cannot connect to MongoDB`

**Solutions:**

1. **Ensure MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # Check if it's running
   tasklist | findstr mongod
   
   # Mac (Homebrew)
   brew services start mongodb-community
   brew services list
   
   # Linux
   sudo systemctl start mongod
   sudo systemctl status mongod
   ```

2. **Verify connection string in `.env`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/afrochinatrade
   ```

3. **Test connection:**
   ```bash
   cd backend
   npm run db:health
   ```

4. **Check MongoDB is listening on correct port:**
   ```bash
   netstat -an | findstr 27017
   ```

---

### 🔴 Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3001`

**Solutions:**

**Windows:**
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace <PID> with actual process ID)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9

# Or use a different port in .env
PORT=3002
```

---

### 🔴 Mobile App Can't Connect to Backend

**Problem:** App shows "Network request failed" or "Cannot connect to server"

**Solutions:**

1. **Use your local IP address, NOT localhost:**
   ```bash
   # Find your IP - Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.5)
   
   # Mac/Linux
   ifconfig
   # Look for inet address
   ```

2. **Update `mobile/.env.local`:**
   ```env
   # Use your actual IP
   EXPO_PUBLIC_API_URL=http://192.168.1.5:3001/api
   ```

3. **Ensure phone and computer are on the same Wi-Fi network**

4. **Check Windows Firewall:**
   - Open Windows Defender Firewall
   - Allow Node.js through firewall
   - Or temporarily disable for testing

5. **Restart Expo dev server:**
   ```bash
   cd mobile
   # Press Ctrl+C to stop
   npm start -- --clear
   ```

---

### 🔴 JWT Token Invalid or Expired

**Problem:** "Invalid token" or "jwt expired" errors

**Solutions:**

1. **Clear app storage and login again (Mobile):**
   - Shake device → "Reload"
   - Or clear Expo cache: `expo start --clear`

2. **Verify JWT_SECRET is set in backend `.env`:**
   ```env
   JWT_SECRET=your-secure-secret-key-minimum-32-characters-long
   ```

3. **Check token format in requests:**
   ```
   Authorization: Bearer <your-token-here>
   ```

---

### 🔴 Cloudinary Upload Fails

**Problem:** Image uploads not working

**Solutions:**

1. **Verify Cloudinary credentials in `.env`:**
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

2. **Check file size (default limit: 10MB)**

3. **Verify file format is supported:**
   - Supported: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`

4. **Test Cloudinary connection:**
   - Check your Cloudinary dashboard
   - Verify upload presets are configured

---

### 🔴 TypeScript / Build Errors

**Problem:** Type errors or build failures

**Solutions:**

1. **Clear build cache and rebuild:**
   ```bash
   # Backend
   cd backend
   Remove-Item -Recurse -Force dist
   npm run build
   
   # Admin
   cd admin
   Remove-Item -Recurse -Force dist
   npm run build
   ```

2. **Check Node.js version:**
   ```bash
   node --version
   # Must be v18 or higher
   ```

3. **Reinstall dependencies:**
   ```bash
   Remove-Item -Recurse -Force node_modules, package-lock.json
   npm install
   ```

---

### 🔴 Expo / React Native Issues

**Problem:** App crashes or won't build

**Solutions:**

1. **Clear Expo cache:**
   ```bash
   cd mobile
   npx expo start --clear
   ```

2. **Clear watchman cache (if installed):**
   ```bash
   watchman watch-del-all
   ```

3. **Reinstall dependencies:**
   ```bash
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

4. **Reset Expo Go app:**
   - Uninstall and reinstall Expo Go on your phone

---

### 🔴 Admin Login Not Working

**Problem:** Can't login to admin dashboard

**Solutions:**

1. **Verify backend is running:**
   ```bash
   # Should see backend running
   curl http://localhost:3001/api/health
   ```

2. **Check admin user exists:**
   ```bash
   cd backend
   npm run db:seed:admin
   ```

3. **Use correct credentials:**
   - Email: `admin@afrochinatrade.com`
   - Password: `Admin123!@#`

4. **Check browser console for errors (F12)**

5. **Verify API URL in `admin/src/config.ts`:**
   ```typescript
   export const API_URL = 'http://localhost:3001/api'
   ```

---

### 🔴 Database Seeding Fails

**Problem:** Seed scripts throw errors

**Solutions:**

1. **Ensure MongoDB is running**

2. **Check connection in `.env`**

3. **Clear database first:**
   ```bash
   cd backend
   npm run db:clear:confirm
   npm run db:seed
   ```

4. **Check for schema validation errors in console**

---

### 🔴 Slow Performance

**Problem:** App or API is slow

**Solutions:**

1. **Check MongoDB indexes:**
   ```bash
   cd backend
   npm run db:verify
   ```

2. **Monitor system resources:**
   - Check CPU/RAM usage
   - Close unnecessary applications

3. **Clear MongoDB logs:**
   - Check MongoDB log size
   - Rotate logs if too large

4. **Optimize queries:**
   - Add indexes to frequently queried fields
   - Use pagination for large datasets

---

### 🔴 Dependencies Won't Install

**Problem:** `npm install` fails

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete and reinstall:**
   ```bash
   Remove-Item -Recurse -Force node_modules, package-lock.json
   npm install
   ```

3. **Check npm registry:**
   ```bash
   npm config get registry
   # Should be: https://registry.npmjs.org/
   ```

4. **Try with legacy peer deps:**
   ```bash
   npm install --legacy-peer-deps
   ```

5. **Update npm:**
   ```bash
   npm install -g npm@latest
   ```

---

### 💡 Still Having Issues?

1. **Check error logs:**
   - Backend: Console output
   - Mobile: Expo DevTools
   - Admin: Browser console (F12)

2. **Verify environment variables are set correctly**

3. **Ensure all prerequisites are installed**

4. **Try restarting services in this order:**
   1. Stop all services
   2. Restart MongoDB
   3. Start backend
   4. Start frontend/mobile

5. **Check project documentation:**
   - [SETUP.md](SETUP.md) - Detailed setup guide
   - [QUICK_START.md](QUICK_START.md) - Quick start guide
   - Component READMEs in each folder

---

## 📚 Documentation

- [SETUP.md](SETUP.md) - Complete setup guide
- [QUICK_START.md](QUICK_START.md) - Quick start guide
- [BUSINESS_OVERVIEW.md](BUSINESS_OVERVIEW.md) - Business model
- [backend/README.md](backend/README.md) - Backend documentation
- [admin/README.md](admin/README.md) - Admin documentation

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Mobile tests
cd mobile
npm test

# Admin tests
cd admin
npm test
```

---

## 🚢 Deployment

### Backend (Vercel)

```bash
cd backend
npm run build
vercel --prod
```

### Mobile (Expo)

```bash
cd mobile
expo build:android
expo build:ios
```

### Admin (Vercel)

```bash
cd admin
npm run build
vercel --prod
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 📞 Support

For questions or issues:
- Check the documentation files
- Review error logs in the console
- Ensure all prerequisites are installed
- Verify environment variables are configured

---

## 🎯 Roadmap

- [ ] Payment gateway integration
- [ ] Real-time chat support
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Mobile app enhancements
- [ ] AI-powered recommendations
- [ ] Supplier verification system
- [ ] Logistics tracking integration

---

**Built with ❤️ for Africa-China trade**
