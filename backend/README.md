# 🚀 AfroChinaTrade Backend API

Express.js + TypeScript + MongoDB backend powering the AfroChinaTrade e-commerce platform.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Configuration](#-environment-configuration)
- [Development](#-development)
- [Database Management](#-database-management)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Scripts Reference](#-scripts-reference)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## 🔧 Prerequisites

Make sure you have the following installed:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MongoDB** v6+ ([Download](https://www.mongodb.com/try/download/community))
- **npm** v8+ (comes with Node.js)

### Verify Installation

```bash
node --version    # Should be v18 or higher
npm --version     # Should be v8 or higher
mongod --version  # Should be v6 or higher
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Then edit `.env` with your configuration (see [Environment Configuration](#-environment-configuration) below).

### 3. Start MongoDB

```bash
# Windows
net start MongoDB

# Mac (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 4. Seed Database (Optional)

```bash
# Create admin user
npm run db:seed:admin

# Seed sample data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

🎉 **Server running at:** `http://localhost:3001`

---

## ⚙️ Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/afrochinatrade` |
| `JWT_SECRET` | Secret for JWT tokens (min 32 chars) | `your-very-secure-secret-key-min-32-chars` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000,http://localhost:8081` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

### Example `.env` File

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/afrochinatrade

# JWT Configuration (CHANGE THIS!)
JWT_SECRET=your-secure-jwt-secret-key-at-least-32-characters-long-change-this

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 💻 Development

### Start Development Server

Hot reload enabled with ts-node-dev:

```bash
npm run dev
```

The server will automatically restart when you make changes to TypeScript files.

### Build for Production

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` folder.

### Run Production Build

```bash
npm start
```

Runs the compiled JavaScript code from `dist/`.

---

## 🗄️ Database Management

### Seeding Commands

```bash
# Seed everything at once
npm run db:seed

# Seed specific data
npm run db:seed:admin              # Create admin user
npm run db:seed:categories         # Seed categories
npm run db:seed:sample             # Seed sample products
npm run db:seed:collections        # Seed product collections
npm run db:seed:category-products  # Seed category-specific products
npm run db:seed:tags               # Seed product tags
```

### Maintenance Commands

```bash
# Health check
npm run db:health

# Verify indexes
npm run db:verify

# Sync product reviews
npm run db:sync:reviews

# Clear database (requires confirmation)
npm run db:clear:confirm

# Clear specific data
npm run db:clear:products:confirm
npm run db:clear:carts
```

### Migration Commands

```bash
npm run db:migrate:products   # Migrate product data
npm run db:migrate:users      # Migrate user data
```

### Admin User Creation

The default admin credentials are:
- **Email:** `admin@afrochinatrade.com`
- **Password:** `Admin123!@#`

```bash
npm run db:seed:admin
```

⚠️ **Important:** Change the admin password after first login!

---

## 📡 API Documentation

### Base URL

- **Local Development:** `http://localhost:3001/api`
- **Production:** `https://your-domain.com/api`

### Core Endpoints

#### Health & Status

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/health` | GET | Server health check | No |

#### Authentication

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/auth/register` | POST | Register new user | No |
| `/auth/login` | POST | User login | No |
| `/auth/me` | GET | Get current user | Yes |
| `/auth/refresh` | POST | Refresh JWT token | Yes |

#### Products

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/products` | GET | List all products | No |
| `/products/:id` | GET | Get product by ID | No |
| `/products` | POST | Create product | Admin |
| `/products/:id` | PUT | Update product | Admin |
| `/products/:id` | DELETE | Delete product | Admin |
| `/products/search` | GET | Search products | No |
| `/products/featured` | GET | Get featured products | No |

#### Orders

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/orders` | GET | List user orders | Yes |
| `/orders/:id` | GET | Get order by ID | Yes |
| `/orders` | POST | Create new order | Yes |
| `/orders/:id/status` | PATCH | Update order status | Admin |

#### Cart

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/cart` | GET | Get user cart | Yes |
| `/cart/items` | POST | Add item to cart | Yes |
| `/cart/items/:id` | PUT | Update cart item | Yes |
| `/cart/items/:id` | DELETE | Remove cart item | Yes |
| `/cart/clear` | DELETE | Clear entire cart | Yes |

#### Reviews

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/reviews` | GET | List reviews | No |
| `/reviews/:id` | GET | Get review by ID | No |
| `/reviews` | POST | Create review | Yes |
| `/reviews/:id` | PUT | Update review | Yes |
| `/reviews/:id` | DELETE | Delete review | Yes/Admin |

#### Categories

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/categories` | GET | List categories | No |
| `/categories/:id` | GET | Get category by ID | No |
| `/categories` | POST | Create category | Admin |
| `/categories/:id` | PUT | Update category | Admin |
| `/categories/:id` | DELETE | Delete category | Admin |

#### Admin Routes

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/admin/analytics` | GET | Platform analytics | Admin |
| `/admin/users` | GET | List all users | Admin |
| `/admin/users/:id/suspend` | PATCH | Suspend user | Admin |
| `/admin/sync-reviews` | POST | Sync product reviews | Admin |

### Request Examples

#### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890"
}
```

#### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Create Order

```bash
POST /api/orders
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "60d5ec49f1b2c72b8c8e4f1a",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "postalCode": "100001"
  }
}
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts           # MongoDB connection
│   │   ├── cloudinary.ts         # Cloudinary config
│   │   └── validateEnv.ts        # Environment validation
│   │
│   ├── controllers/              # Request handlers
│   │   ├── authController.ts
│   │   ├── productController.ts
│   │   ├── orderController.ts
│   │   ├── cartController.ts
│   │   ├── reviewController.ts
│   │   ├── categoryController.ts
│   │   └── adminController.ts
│   │
│   ├── models/                   # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   ├── Cart.ts
│   │   ├── Review.ts
│   │   └── Category.ts
│   │
│   ├── routes/                   # API routes
│   │   ├── authRoutes.ts
│   │   ├── productRoutes.ts
│   │   ├── orderRoutes.ts
│   │   ├── cartRoutes.ts
│   │   └── adminRoutes.ts
│   │
│   ├── middleware/               # Custom middleware
│   │   ├── auth.ts              # JWT authentication
│   │   ├── errorHandler.ts      # Error handling
│   │   ├── upload.ts            # File upload
│   │   └── validation.ts        # Input validation
│   │
│   ├── services/                 # Business logic
│   │   ├── emailService.ts
│   │   ├── notificationService.ts
│   │   └── recommendationService.ts
│   │
│   ├── utils/                    # Utilities
│   │   ├── logger.ts
│   │   └── helpers.ts
│   │
│   ├── scripts/                  # Database scripts
│   │   ├── seedAdmin.ts
│   │   ├── seedAll.ts
│   │   └── ...
│   │
│   └── index.ts                  # App entry point
│
├── api/
│   └── index.ts                  # Vercel serverless entry
│
├── dist/                         # Compiled JS (generated)
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Environment template
├── package.json
├── tsconfig.json
├── vercel.json                   # Vercel deployment config
└── README.md
```

---

## 📜 Scripts Reference

### Development

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start dev server with hot reload |
| `dev:prod` | `npm run dev:prod` | Start dev server in production mode |

### Build & Start

| Script | Command | Description |
|--------|---------|-------------|
| `build` | `npm run build` | Compile TypeScript to JavaScript |
| `start` | `npm start` | Run compiled production code |
| `start:prod` | `npm run start:prod` | Run production server |

### Testing

| Script | Command | Description |
|--------|---------|-------------|
| `test` | `npm test` | Run test suite |
| `test:watch` | `npm run test:watch` | Run tests in watch mode |
| `test:coverage` | `npm run test:coverage` | Generate coverage report |

### Database

See [Database Management](#-database-management) section for all database scripts.

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables:**
   - Go to your Vercel project dashboard
   - Add all environment variables from `.env`
   - Redeploy if needed

### Environment Setup on Vercel

Make sure to set these in your Vercel project settings:
- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NODE_ENV=production`

### Manual Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder to your server**

3. **Install production dependencies:**
   ```bash
   npm install --production
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

**Problem:** Cannot connect to MongoDB

**Solutions:**
1. Ensure MongoDB is running:
   ```bash
   # Windows
   net start MongoDB
   
   # Mac
   brew services start mongodb-community
   ```

2. Check connection string in `.env`
3. Verify MongoDB is accessible on the specified port (default: 27017)
4. Check firewall settings

### Port Already in Use

**Problem:** `EADDRINUSE: address already in use :::3001`

**Solutions:**
1. Find and kill the process:
   ```bash
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:3001 | xargs kill -9
   ```

2. Or use a different port in `.env`:
   ```env
   PORT=3002
   ```

### TypeScript Errors

**Problem:** Type errors during build

**Solutions:**
1. Clear TypeScript cache:
   ```bash
   rm -rf dist
   npm run build
   ```

2. Check `tsconfig.json` configuration
3. Ensure all types are properly imported

### Cloudinary Upload Fails

**Problem:** Image uploads not working

**Solutions:**
1. Verify Cloudinary credentials in `.env`
2. Check file size (max 10MB by default)
3. Ensure file format is supported (jpg, png, webp, etc.)
4. Check Cloudinary account quota

### JWT Token Invalid

**Problem:** "Invalid token" or "Token expired"

**Solutions:**
1. Verify `JWT_SECRET` is set correctly
2. Check token expiration time
3. Ensure Authorization header format: `Bearer <token>`
4. Re-login to get a fresh token

### Dependencies Not Installing

**Problem:** `npm install` fails

**Solutions:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check Node.js version (must be v18+)

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt (cost factor 12)
- ✅ Input validation and sanitization
- ✅ MongoDB injection protection
- ✅ Rate limiting (configurable)
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Secure file uploads with size limits
- ✅ Environment variable validation
- ✅ Request logging

---

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Watch mode for development:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [JWT.io](https://jwt.io/)

---

## 📞 Support

For issues or questions:
- Check the [Troubleshooting](#-troubleshooting) section
- Review API documentation above
- Check server logs for error details
- Verify environment configuration

---

**Built with ❤️ for AfroChinaTrade**
