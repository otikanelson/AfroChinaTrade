# AfroChinaTrade

A comprehensive e-commerce platform connecting African dealers with Chinese manufacturers through secure wholesale trading.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D6.0-green.svg)

---

## 🌍 About

**AfroChinaTrade** is a digital wholesale trading platform that bridges African and Chinese markets by providing:

- Direct factory-to-dealer connections
- Transparent pricing without hidden markups
- Integrated logistics and shipping
- Secure payment and cargo handling
- End-to-end trade facilitation

For more details, see [BUSINESS_OVERVIEW.md](BUSINESS_OVERVIEW.md)

---

## 🏗️ Architecture

This is a monorepo containing multiple applications:

```
AfroChinaTrade/
├── backend/          # Express.js + TypeScript API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── config/
│   └── package.json
│
├── mobile/           # React Native + Expo mobile app
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── navigation/
│   │   └── services/
│   └── package.json
│
├── admin/            # React admin dashboard
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/
│   └── package.json
│
├── web/              # Web frontend
├── shared/           # Shared types and utilities
└── package.json      # Root workspace configuration
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MongoDB** v6+ ([Download](https://www.mongodb.com/try/download/community))
- **npm** (comes with Node.js)

### Installation

#### Automated Setup (Windows):

```powershell
.\setup.ps1
```

#### Manual Setup:

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..
cd mobile && npm install && cd ..
cd admin && npm install && cd ..

# Setup environment files
cp backend/.env.example backend/.env
cp mobile/.env.example mobile/.env.local

# Configure your settings (see SETUP.md)
```

### Configuration

1. **Backend** (`backend/.env`):
   - Set `MONGODB_URI`
   - Generate and set `JWT_SECRET` (32+ characters)
   - Configure Cloudinary credentials

2. **Mobile** (`mobile/.env.local`):
   - Set `EXPO_PUBLIC_API_URL` to your local IP
   - Configure environment settings

See [SETUP.md](SETUP.md) for detailed instructions.

### Running

```bash
# Start MongoDB
net start MongoDB  # Windows
# or
brew services start mongodb-community  # Mac

# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Mobile App
cd mobile
npm start

# Terminal 3: Admin Dashboard
cd admin
npm run dev
```

📖 **Full guide**: See [QUICK_START.md](QUICK_START.md)

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

## 🗂️ Key Features

### For Buyers
- ✅ Browse wholesale products by category
- ✅ Direct manufacturer pricing
- ✅ Secure checkout and payment
- ✅ Order tracking
- ✅ Delivery address management
- ✅ Product reviews and ratings
- ✅ Saved favorites and wishlists

### For Sellers
- ✅ Product listing and management
- ✅ Inventory tracking
- ✅ Order fulfillment
- ✅ Analytics and insights
- ✅ Customer communication

### For Admins
- ✅ Complete platform oversight
- ✅ User and product moderation
- ✅ Analytics and reports
- ✅ Category management
- ✅ Refund processing
- ✅ Support ticket management

---

## 🛠️ Development

### Backend Commands

```bash
cd backend

# Development
npm run dev              # Start with hot reload
npm run build            # Build TypeScript
npm run start            # Production server

# Database
npm run db:seed          # Seed all data
npm run db:seed:admin    # Create admin user
npm run db:clear         # Clear database
npm run db:health        # Check connection

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Mobile Commands

```bash
cd mobile

# Development
npm start                # Start Expo
npm run android          # Run on Android
npm run ios              # Run on iOS (Mac only)

# Testing
npm test                 # Run tests
npm run lint             # Lint code
```

### Admin Commands

```bash
cd admin

# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview build

# Quality
npm run lint             # Lint code
npm run type-check       # Check types
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

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
net start MongoDB  # Windows

# Verify connection
npm run db:health
```

### Port Conflicts

```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process
taskkill /PID <PID> /F
```

### Mobile App Connection Issues

- Use your **local IP address**, not `localhost`
- Ensure phone and computer are on the **same Wi-Fi network**
- Check Windows Firewall settings
- Verify `EXPO_PUBLIC_API_URL` in `.env.local`

For more solutions, see [SETUP.md](SETUP.md)

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
