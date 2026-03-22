# Delivery System - Quick Start Guide

## 5-Minute Setup

### Backend
```bash
cd backend
npm install  # if needed
npm run dev
```

### Mobile
```bash
cd mobile
npm install  # if needed
expo install expo-location
npm start
```

## Test the System

### 1. Get States (No Auth Required)
```bash
curl http://localhost:3000/api/locations/states
```

### 2. Get LGAs for Lagos
```bash
curl http://localhost:3000/api/locations/states/Lagos/lgas
```

### 3. Create Address (Requires Auth)
```bash
curl -X POST http://localhost:3000/api/addresses \
  -H "Authorization: Bearer YOUR_TOKEN" \
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

### 4. Get All Addresses
```bash
curl http://localhost:3000/api/addresses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Mobile App Flow

1. **Login** → Account → Delivery Addresses
2. **Add Address** → Fill form → Get Location → Select State/LGA → Save
3. **Edit Address** → Tap Edit → Modify → Save Changes
4. **Set Default** → Tap Set Default on any address
5. **Delete** → Tap trash icon → Confirm

## Key Files

| File | Purpose |
|------|---------|
| `backend/src/controllers/deliveryAddressController.ts` | Address CRUD logic |
| `backend/src/controllers/locationController.ts` | State/LGA endpoints |
| `backend/src/routes/deliveryAddressRoutes.ts` | Address routes |
| `backend/src/routes/locationRoutes.ts` | Location routes |
| `mobile/app/addresses.tsx` | Address list screen |
| `mobile/app/addresses/new.tsx` | Create address screen |
| `mobile/app/addresses/[id].tsx` | Edit address screen |
| `mobile/services/AddressService.ts` | API client |

## API Endpoints

### Addresses (Protected)
- `GET /api/addresses` - List all
- `GET /api/addresses/:id` - Get one
- `POST /api/addresses` - Create
- `PUT /api/addresses/:id` - Update
- `DELETE /api/addresses/:id` - Delete
- `PATCH /api/addresses/:id/set-default` - Set default

### Locations (Public)
- `GET /api/locations/states` - Get states
- `GET /api/locations/states/:state/lgas` - Get LGAs

## Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install` in backend/mobile |
| Location permission denied | Grant in app settings |
| "State not found" | Check state name spelling (case-sensitive) |
| CORS error | Verify backend is running |
| Empty state/LGA list | Check network tab, verify API response |

## Required Permissions (Mobile)

- **Location**: For device GPS capture
- **Network**: For API calls

## Environment Variables (Backend)

```
MONGODB_URI=your_mongodb_url
JWT_SECRET=your_secret
PORT=3000
NODE_ENV=development
```

## Database

No manual setup needed - MongoDB collections created automatically.

## Next: Payment Methods

After testing addresses, implement payment methods:
1. Create PaymentMethod model
2. Add payment routes/controller
3. Integrate Paystack API
4. Update checkout screen

## Documentation

- **DELIVERY_SYSTEM.md** - Full documentation
- **DELIVERY_SETUP.md** - Detailed setup guide
- **IMPLEMENTATION_SUMMARY.md** - What was built

## Support

1. Check error codes in response
2. Review console logs
3. Check network tab in debugger
4. Read DELIVERY_SYSTEM.md for details

---

**Ready to test?** Start backend and mobile, then navigate to addresses screen!
