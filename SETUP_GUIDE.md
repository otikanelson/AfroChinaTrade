# AfroChinaTrade Setup Guide

## Prerequisites

- Node.js 18+ and npm
- For mobile development: Expo Go app on your phone or Android Studio/Xcode for emulators

## Initial Setup

### 1. Install Dependencies

From the root directory, run:

```bash
npm install
```

This will install dependencies for all three workspaces (shared, mobile, admin).

### 2. Verify Installation

Check that all workspaces are properly linked:

```bash
npm run test
```

This should run tests across all workspaces.

## Running the Applications

### Mobile App

```bash
npm run mobile
```

This will start the Expo development server. You can then:
- Scan the QR code with Expo Go app (iOS/Android)
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator
- Press `w` to open in web browser

### Admin Dashboard

```bash
npm run admin
```

This will start the Vite development server and open the admin dashboard in your browser at `http://localhost:3000`.

## Development Workflow

### Running Tests

**All workspaces:**
```bash
npm test
```

**Specific workspace:**
```bash
npm run test:mobile
npm run test:admin
npm run test:shared
```

**Watch mode (for development):**
```bash
cd mobile && npm run test:watch
cd admin && npm run test:watch
cd shared && npm run test:watch
```

### Linting

```bash
npm run lint
```

### Code Formatting

```bash
npm run format
```

## Project Structure

```
afrochinatrade/
├── shared/              # Shared TypeScript library
│   ├── src/
│   │   ├── types/      # TypeScript interfaces
│   │   ├── services/   # Data service layer
│   │   └── utils/      # Utility functions
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
│
├── mobile/             # React Native mobile app (Expo)
│   ├── app/            # Expo Router screens
│   │   ├── (tabs)/     # Customer-facing tabs
│   │   └── (admin)/    # Admin dashboard (protected)
│   ├── components/
│   ├── services/
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
│
├── package.json        # Root package.json (workspace config)
├── tsconfig.json       # Root TypeScript config
├── .eslintrc.json      # ESLint configuration
└── .prettierrc.json    # Prettier configuration
```

## Workspace Dependencies

The `shared` workspace is used by both `mobile` and `admin`:

```json
{
  "dependencies": {
    "@afrochinatrade/shared": "*"
  }
}
```

When you make changes to the shared library, they are immediately available to both apps.

## Testing Strategy

### Unit Tests
- Test individual functions and components
- Located alongside source files (*.test.ts, *.test.tsx)

### Property-Based Tests
- Use fast-check for property-based testing
- Test universal properties across many inputs
- Located in __tests__ directories

### Integration Tests
- Test complete user flows
- Test service layer interactions

## Common Issues

### Issue: "Cannot find module '@afrochinatrade/shared'"

**Solution:** Run `npm install` from the root directory to ensure workspace linking is set up correctly.

### Issue: Metro bundler cache issues (mobile)

**Solution:** Clear the cache:
```bash
cd mobile
expo start -c
```

### Issue: TypeScript errors in IDE

**Solution:** Restart your TypeScript server in your IDE or run:
```bash
npm run build --workspace=shared
```

## Next Steps

1. Implement shared types and interfaces (Task 2)
2. Implement storage adapter layer (Task 3)
3. Build out the data service layer (Tasks 4-13)
4. Develop mobile app screens (Tasks 15-35)
5. Build admin dashboard (Tasks 37-50)

## Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Jest Documentation](https://jestjs.io/)
- [fast-check Documentation](https://fast-check.dev/)
