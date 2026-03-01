# @afrochinatrade/shared

Shared TypeScript library containing types, services, and utilities for the AfroChinaTrade platform.

## Structure

```
src/
├── types/              # TypeScript type definitions
│   ├── entities.ts     # Core entity types (Product, User, Order, etc.)
│   ├── context.ts      # Context state types
│   ├── service.ts      # Service response types
│   └── filters.ts      # Filter and search types
│
├── services/           # Data service layer
│   ├── storage/        # Storage adapter interface
│   ├── ProductService.ts
│   ├── CategoryService.ts
│   ├── UserService.ts
│   ├── OrderService.ts
│   ├── SupplierService.ts
│   ├── ReviewService.ts
│   ├── AnalyticsService.ts
│   └── MockDataGenerator.ts
│
└── utils/              # Utility functions
    ├── IDGenerator.ts      # Unique ID generation
    ├── DataSerializer.ts   # JSON serialization/parsing
    ├── ServiceError.ts     # Error handling
    └── validation.ts       # Data validation
```

## Usage

### In Mobile App

```typescript
import { Product, ProductService } from '@afrochinatrade/shared';

const productService = new ProductService(storageAdapter);
const products = await productService.getAllProducts();
```

### In Admin Dashboard

```typescript
import { User, UserService } from '@afrochinatrade/shared';

const userService = new UserService(storageAdapter);
const users = await userService.getAllUsers();
```

## Key Features

### Backend-Agnostic Architecture
The service layer abstracts all data operations through a `StorageAdapter` interface. This allows seamless switching between:
- LocalStorage (web)
- AsyncStorage (mobile)
- REST API (future)

### Type Safety
Comprehensive TypeScript types ensure type safety across the entire platform.

### Mock Data
Built-in mock data generators enable full functionality without a backend.

### Validation
Centralized validation utilities ensure data integrity.

## Development

### Build
```bash
npm run build
```

### Test
```bash
npm test
```

### Lint
```bash
npm run lint
```
