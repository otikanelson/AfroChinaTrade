# AfroChinaTrade Admin Dashboard

A modern web-based admin dashboard for managing the AfroChinaTrade platform.

## Features

- 📊 Dashboard with analytics overview
- 📦 Product management
- 🛒 Order management
- 👥 User management
- 💬 Message management
- 📝 Review moderation
- 💰 Refund management
- 📂 Category management
- 🔐 Authentication & Authorization
- 📱 Responsive design

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your API URL
# VITE_API_URL=http://localhost:3000/api
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint

# Type checking
npm run type-check
```

## Project Structure

```
admin/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   └── Sidebar.tsx
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Products.tsx
│   │   ├── Orders.tsx
│   │   ├── Users.tsx
│   │   ├── Categories.tsx
│   │   ├── Refunds.tsx
│   │   ├── Reviews.tsx
│   │   ├── Messages.tsx
│   │   ├── Login.tsx
│   │   └── NotFound.tsx
│   ├── services/         # API services
│   │   └── api.ts
│   ├── store/           # Zustand stores
│   │   └── authStore.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## API Integration

The dashboard connects to the backend API at `http://localhost:3000/api`. Make sure the backend is running before starting the admin dashboard.

### Available Endpoints

- `GET /api/admin/analytics` - Get analytics data
- `GET /api/products` - Get all products
- `GET /api/orders` - Get all orders
- `GET /api/users` - Get all users
- `GET /api/categories` - Get all categories
- `GET /api/refunds` - Get all refunds
- `GET /api/reviews` - Get all reviews
- `GET /api/messages` - Get all messages
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

## Authentication

The dashboard uses JWT token-based authentication. Tokens are stored in localStorage and automatically included in API requests.

### Login Flow

1. User enters credentials on login page
2. Backend validates and returns JWT token
3. Token is stored in localStorage
4. Token is included in all subsequent API requests
5. If token expires (401), user is redirected to login

## Styling

The dashboard uses Tailwind CSS with a custom color scheme:

- **Primary**: `#FF6B35` (Orange)
- **Secondary**: `#004E89` (Blue)
- **Accent**: `#F7931E` (Gold)
- **Success**: `#10B981` (Green)
- **Warning**: `#F59E0B` (Amber)
- **Error**: `#EF4444` (Red)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and type checking
4. Submit a pull request

## License

MIT
