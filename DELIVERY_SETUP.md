# Delivery System Setup Guide

## Quick Start

### Backend Setup

1. **Install Dependencies** (if not already installed)
   ```bash
   cd backend
   npm install
   ```

2. **Verify Environment Variables**
   Ensure your `.env` file has:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=3000
   NODE_ENV=development
   ```

3. **Start Backend Server**
   ```bash
   npm run dev
   ```

4. **Verify API Endpoints**
   - Health check: `GET http://localhost:3000/api/health`
   - Get states: `GET http://localhost:3000/api/locations/states`

### Mobile Setup

1. **Install Dependencies**
   ```bash
   cd mobile
   npm install
   # or
   yarn install
   ```

2. **Install Expo Location**
   ```bash
   expo install expo-location
   ```

3. **Update Constants** (if needed)
   Check `mobile/constants/config.ts` for API_BASE_URL:
   ```typescript
   export const API_BASE_URL = 'http://your-backend-url/api';
   ```

4. **Start Mobile App**
   ```bash
   npm start
   # or
   expo start
   ```

5. **Test on Device/Emulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## Testing the Delivery System

### 1. Test Backend Endpoints

#### Get All States
```bash
curl http://localhost:3000/api/locations/states
```

#### Get LGAs for Lagos
```bash
curl http://localhost:3000/api/locations/states/Lagos/lgas
```

#### Create Address (requires authentication)
```bash
curl -X POST http://localhost:3000/api/addresses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "home",
    "fullName": "John Doe",
    "phoneNumber": "+234801234567",
    "addressLine1": "123 Main Street",
    "city": "Lagos",
    "state": "Lagos",
    "localGovernment": "Ikoyi",
    "isDefault": true
  }'
```

#### Get All Addresses
```bash
curl http://localhost:3000/api/addresses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Test Mobile App

1. **Navigate to Addresses Screen**
   - From account/profile screen, tap "Delivery Addresses"

2. **Add New Address**
   - Tap the "+" button
   - Fill in all required fields
   - Select state and LGA from dropdowns
   - Tap "Get Current Location" to capture device GPS
   - Tap "Add Address"

3. **Edit Address**
   - Tap "Edit" on any address card
   - Modify fields as needed
   - Tap "Save Changes"

4. **Set Default Address**
   - Tap "Set Default" on any address
   - Verify it shows "Default" badge

5. **Delete Address**
   - Tap trash icon
   - Confirm deletion

## Troubleshooting

### Backend Issues

**Issue: "Cannot find module 'DeliveryAddress'"**
- Solution: Ensure `backend/src/models/DeliveryAddress.ts` exists
- Check: `backend/src/models/index.ts` exports the model

**Issue: "State not found" error**
- Solution: Verify `backend/src/data/nigerianStatesLGAs.ts` has correct data
- Check: State names match exactly (case-sensitive)

**Issue: CORS errors**
- Solution: Check `backend/src/middleware/security.ts` corsMiddleware
- Ensure mobile app URL is in CORS whitelist

### Mobile Issues

**Issue: "Location permission denied"**
- Solution: Grant location permission in app settings
- iOS: Settings > App > Permissions > Location
- Android: Settings > Apps > App > Permissions > Location

**Issue: "Cannot connect to backend"**
- Solution: Verify API_BASE_URL in `mobile/constants/config.ts`
- Check: Backend server is running
- Test: `curl http://your-backend-url/api/health`

**Issue: "State/LGA dropdown is empty"**
- Solution: Verify backend `/api/locations/states` endpoint works
- Check: Network tab in React Native debugger
- Ensure: States data is properly loaded

**Issue: "Device location not working"**
- Solution: Ensure `expo-location` is installed
- Check: Location permission is granted
- Verify: Device has GPS enabled

## Database Setup

### MongoDB Collections

The system automatically creates the following collection:

**DeliveryAddress Collection**
```javascript
db.createCollection("deliveryaddresses", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "fullName", "phoneNumber", "addressLine1", "city", "state"],
      properties: {
        userId: { bsonType: "objectId" },
        type: { enum: ["home", "work", "other"] },
        isDefault: { bsonType: "bool" },
        fullName: { bsonType: "string" },
        phoneNumber: { bsonType: "string" },
        addressLine1: { bsonType: "string" },
        addressLine2: { bsonType: "string" },
        city: { bsonType: "string" },
        state: { bsonType: "string" },
        localGovernment: { bsonType: "string" },
        country: { bsonType: "string" },
        postalCode: { bsonType: "string" },
        landmark: { bsonType: "string" },
        deliveryInstructions: { bsonType: "string" },
        location: {
          bsonType: "object",
          properties: {
            latitude: { bsonType: "double" },
            longitude: { bsonType: "double" },
            accuracy: { bsonType: "double" }
          }
        },
        isActive: { bsonType: "bool" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

// Create indexes
db.deliveryaddresses.createIndex({ userId: 1 });
db.deliveryaddresses.createIndex({ userId: 1, isDefault: 1 });
db.deliveryaddresses.createIndex({ userId: 1, createdAt: -1 });
```

## Integration with Checkout

The delivery address system integrates with the checkout flow:

1. **Checkout Screen** (`mobile/app/checkout.tsx`)
   - Fetches user's delivery addresses
   - Allows selection of delivery address
   - Passes selected address to order creation

2. **Order Creation**
   - Backend receives selected address ID
   - Validates address belongs to user
   - Stores address details in order

3. **Order Model** (`backend/src/models/Order.ts`)
   - Includes deliveryAddress subdocument
   - Stores address snapshot at order time

## Next Steps

### Payment Methods (Future)
The system is designed to work with payment methods:

1. Create `PaymentMethod` model
2. Add payment method routes and controller
3. Integrate with Paystack API
4. Update checkout to select payment method

### Delivery Zones (Future)
Extend the system with delivery zones:

1. Create `DeliveryZone` model
2. Map states/LGAs to zones
3. Calculate delivery fees
4. Estimate delivery time

## Support

For issues or questions:
1. Check the `DELIVERY_SYSTEM.md` documentation
2. Review error codes and troubleshooting section
3. Check backend logs: `npm run dev` output
4. Check mobile logs: React Native debugger or Expo CLI

## Performance Tips

1. **Cache States/LGAs**: Store in mobile app state after first fetch
2. **Lazy Load Addresses**: Load only when needed
3. **Optimize Queries**: Use indexes on userId
4. **Batch Operations**: Update multiple addresses efficiently

## Security Checklist

- [ ] JWT tokens are properly validated
- [ ] Users can only access their own addresses
- [ ] Location data is optional and user-controlled
- [ ] All inputs are validated and sanitized
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled (if needed)
- [ ] Database backups are configured
