# Models

This directory contains Mongoose models for the AfroChinaTrade backend.

## User Model

The User model represents user accounts in the system.

### Schema Fields

- **name** (String, required): User's full name (2-100 characters)
- **email** (String, required, unique): User's email address (lowercase, validated format)
- **password** (String, required): Hashed password (min 8 characters, auto-hashed with bcrypt)
- **phone** (String, optional): User's phone number
- **role** (Enum, default: 'customer'): User role - 'customer', 'admin', or 'super_admin'
- **status** (Enum, default: 'active'): Account status - 'active' or 'blocked'
- **addresses** (Array): Array of address objects with street, city, state, country, postalCode, isDefault
- **avatar** (String, optional): URL to user's avatar image
- **createdAt** (Date, auto): Timestamp of account creation
- **updatedAt** (Date, auto): Timestamp of last update

### Indexes

- **email**: Unique index for fast lookups and uniqueness constraint
- **role + status**: Compound index for efficient role-based and status-based queries

### Methods

- **comparePassword(candidatePassword: string)**: Compares a plain text password with the hashed password

### Pre-save Hook

The model automatically hashes passwords using bcrypt before saving to the database. The password is only hashed if it has been modified.

### Usage Example

```typescript
import User from './models/User';

// Create a new user
const user = new User({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'customer',
});

await user.save(); // Password is automatically hashed

// Compare password
const isMatch = await user.comparePassword('password123'); // true
```

### Testing

Run tests with:
```bash
npm test -- --testPathPatterns=User.test.ts
```
