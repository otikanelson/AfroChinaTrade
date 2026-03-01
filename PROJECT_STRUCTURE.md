# AfroChinaTrade Project Structure

This is a monorepo containing the AfroChinaTrade e-commerce platform with three main workspaces:

## Workspaces

### 1. `shared/` - Shared Code Library
Contains all shared TypeScript types, services, and utilities used by both mobile and admin apps.

**Structure:**
- `src/types/` - TypeScript interfaces and types
- `src/services/` - Data service layer (ProductService, UserService, etc.)
- `src/utils/` - Utility functions (IDGenerator, DataSerializer, validation)

**Key Features:**
- Backend-agnostic data service layer
- Local storage adapters for web and mobile
- Mock data generators
- Comprehensive TypeScript types

### 2. `mobile/` - React Native Mobile App
Customer-facing mobile application built with React Native and Expo.

**Tech Stack:**
- React Native 0.81.5
- Expo ~54.0.0
- React Navigation
- Styled Components
- AsyncStorage for local persistence

**Features:**
- Product browsing and search
- Shopping cart management
- Wishlist/favorites
- User authentication
- Order placement and tracking

### 3. `admin/` - React Admin Dashboard
Web-based administrative interface for platform management.

**Tech Stack:**
- React 18
- Vite (build tool)
- React Router
- Styled Components
- LocalStorage for persistence

**Features:**
- Product management (CRUD)
- Category management
- Order management
- User management
- Supplier management
- Analytics dashboard

## Development Setup

### Install Dependencies
```bash
npm install
```

This will install dependencies for all workspaces.

### Run Applications

**Mobile App:**
```bash
npm run mobile
```

**Admin Dashboard:**
```bash
npm run admin
```

### Testing

**Run all tests:**
```bash
npm test
```

**Run tests for specific workspace:**
```bash
npm run test:mobile
npm run test:admin
npm run test:shared
```

### Linting and Formatting

**Lint all workspaces:**
```bash
npm run lint
```

**Format code:**
```bash
npm run format
```

## Testing Frameworks

- **Jest** - Unit testing framework
- **React Testing Library** - Component testing
- **fast-check** - Property-based testing

## Configuration Files

- `.eslintrc.json` - ESLint configuration
- `.prettierrc.json` - Prettier code formatting
- `tsconfig.json` - Root TypeScript configuration
- Each workspace has its own `tsconfig.json` and `jest.config.js`

## Architecture

The platform uses a **frontend-first, backend-agnostic architecture**:

1. **Data Service Layer** (in `shared/`) abstracts all data operations
2. **Storage Adapters** provide a unified interface for LocalStorage/AsyncStorage
3. **Context Providers** manage global state (Auth, Cart, Favorites)
4. **Mock Data** enables full functionality without a backend

This design allows seamless transition to REST API integration in the future without changing application code.
