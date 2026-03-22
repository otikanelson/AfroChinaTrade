# Delivery Address System Documentation

## Overview

The delivery address system allows users to manage multiple delivery addresses with device location support and Nigerian state/local government selection. This system is designed for the e-commerce platform to streamline the checkout and order delivery process.

## Features

### Backend Features

1. **Delivery Address Management**
   - Create, read, update, and delete delivery addresses
   - Support for address types: home, work, other
   - Set default address for quick checkout
   - Soft delete (addresses marked as inactive)
   - Device location storage (GPS coordinates with accuracy)

2. **Location Data**
   - Nigerian states and local governments (LGAs) reference data
   - Public API endpoints for state/LGA selection
   - Searchable state and LGA lists

3. **Address Fields**
   - Full name and phone number
   - Address lines (primary and secondary)
   - City, state, local government, postal code
   - Landmark and delivery instructions
   - Device location (latitude, longitude, accuracy)
   - Address type and default status

### Mobile Features

1. **Address Management Screen**
   - View all delivery addresses
   - Add new addresses
   - Edit existing addresses
   - Delete addresses
   - Set default address
   - Empty state with call-to-action

2. **Address Form**
   - Address type selector (home/work/other)
   - Personal information fields
   - Address details with state/LGA picker
   - Device location capture with permission handling
   - Additional information (landmark, delivery instructions)
   - Default address checkbox
   - Form validation

3. **Location Features**
   - Device GPS location capture using Expo Location
   - Location accuracy display
   - Searchable state and LGA modals
   - Fallback for location permission denial

## API Endpoints

### Delivery Addresses

All endpoints require authentication (Bearer token).

#### Get All Addresses
```
GET /api/addresses
Response: { status: 'success', data: DeliveryAddress[] }
```

#### Get Single Address
```
GET /api/addresses/:id
Response: { status: 'success', data: DeliveryAddress }
```

#### Create Address
```
POST /api/addresses
Body: {
  type: 'home' | 'work' | 'other',
  fullName: string,
  phoneNumber: string,
  addressLine1: string,
  addressLine2?: string,
  city: string,
  state: string,
  localGovernment?: string,
  postalCode?: string,
  landmark?: string,
  deliveryInstructions?: string,
  location?: { latitude: number, longitude: number, accuracy?: number },
  isDefault?: boolean
}
Response: { status: 'success', message: string, data: DeliveryAddress }
```

#### Update Address
```
PUT /api/addresses/:id
Body: Partial of Create Address fields
Response: { status: 'success', message: string, data: DeliveryAddress }
```

#### Delete Address
```
DELETE /api/addresses/:id
Response: { status: 'success', message: string }
```

#### Set Default Address
```
PATCH /api/addresses/:id/set-default
Response: { status: 'success', message: string, data: DeliveryAddress }
```

### Location Data

Public endpoints (no authentication required).

#### Get All States
```
GET /api/locations/states
Response: { status: 'success', data: string[] }
```

#### Get LGAs for State
```
GET /api/locations/states/:state/lgas
Response: { status: 'success', data: string[] }
```

## Data Models

### DeliveryAddress (MongoDB)

```typescript
interface IDeliveryAddress extends Document {
  userId: ObjectId;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  
  // Address details
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  localGovernment?: string;
  country: string;
  postalCode?: string;
  
  // Device location
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  
  // Additional details
  landmark?: string;
  deliveryInstructions?: string;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Mobile TypeScript Interfaces

```typescript
interface DeliveryAddress {
  _id: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  localGovernment?: string;
  country: string;
  postalCode?: string;
  landmark?: string;
  deliveryInstructions?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}
```

## File Structure

### Backend

```
backend/src/
├── controllers/
│   ├── deliveryAddressController.ts    # Address CRUD operations
│   └── locationController.ts           # State/LGA endpoints
├── routes/
│   ├── deliveryAddressRoutes.ts        # Address routes
│   └── locationRoutes.ts               # Location routes
├── models/
│   └── DeliveryAddress.ts              # MongoDB schema
├── data/
│   └── nigerianStatesLGAs.ts           # States and LGAs reference data
└── index.ts                            # Route registration
```

### Mobile

```
mobile/app/
├── addresses.tsx                       # Address list screen
├── addresses/
│   ├── new.tsx                         # Create address screen
│   └── [id].tsx                        # Edit address screen
└── services/
    └── AddressService.ts               # Address API service
```

## Usage Examples

### Backend - Create Address

```typescript
const response = await fetch('http://localhost:3000/api/addresses', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'home',
    fullName: 'John Doe',
    phoneNumber: '+234801234567',
    addressLine1: '123 Main Street',
    city: 'Lagos',
    state: 'Lagos',
    localGovernment: 'Ikoyi',
    location: {
      latitude: 6.4969,
      longitude: 3.3519,
      accuracy: 10
    },
    isDefault: true
  })
});
```

### Mobile - Get Addresses

```typescript
import AddressService from '../services/AddressService';

const addresses = await AddressService.getAddresses();
if (addresses.success) {
  console.log(addresses.data);
}
```

### Mobile - Create Address

```typescript
const newAddress = await AddressService.createAddress({
  type: 'home',
  fullName: 'Jane Doe',
  phoneNumber: '+234801234567',
  addressLine1: '456 Oak Avenue',
  city: 'Abuja',
  state: 'Federal Capital Territory',
  localGovernment: 'Abuja Municipal Area Council',
  isDefault: false
});
```

### Mobile - Get States and LGAs

```typescript
// Get all states
const states = await AddressService.getStates();

// Get LGAs for a state
const lgas = await AddressService.getLGAsForState('Lagos');
```

## Device Location Integration

The system uses Expo Location to capture device GPS coordinates:

```typescript
import * as Location from 'expo-location';

const getDeviceLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert('Permission Denied', 'Location permission is required');
    return;
  }

  const currentLocation = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { latitude, longitude, accuracy } = currentLocation.coords;
  // Use these coordinates in address creation/update
};
```

## Validation Rules

### Required Fields
- Full Name
- Phone Number
- Address Line 1
- City
- State

### Optional Fields
- Address Line 2
- Local Government
- Postal Code
- Landmark
- Delivery Instructions
- Device Location

### Constraints
- Only one default address per user (enforced by pre-save hook)
- Delivery instructions max 500 characters
- Soft delete (isActive flag) for data retention

## Error Handling

### Common Error Codes

| Code | Message | Status |
|------|---------|--------|
| MISSING_FIELDS | Missing required fields | 400 |
| ADDRESS_NOT_FOUND | Address not found | 404 |
| CREATE_ADDRESS_ERROR | Failed to create address | 500 |
| UPDATE_ADDRESS_ERROR | Failed to update address | 500 |
| DELETE_ADDRESS_ERROR | Failed to delete address | 500 |
| SET_DEFAULT_ADDRESS_ERROR | Failed to set default address | 500 |
| FETCH_STATES_ERROR | Failed to fetch states | 500 |
| FETCH_LGAS_ERROR | Failed to fetch LGAs | 500 |

## Future Enhancements

1. **Payment Methods Integration**
   - Add payment method management (Paystack integration)
   - Support for multiple payment methods
   - Default payment method selection

2. **Address Verification**
   - Google Maps API integration for address validation
   - Geocoding for address standardization
   - Distance calculation for delivery zones

3. **Delivery Zones**
   - Define delivery zones by state/LGA
   - Calculate delivery fees based on location
   - Delivery time estimation

4. **Address History**
   - Track address changes
   - Audit log for address modifications
   - Restore deleted addresses

5. **Bulk Address Import**
   - CSV import for multiple addresses
   - Address book integration
   - Contact sync

## Testing

### Backend Testing

```bash
# Test create address
curl -X POST http://localhost:3000/api/addresses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "home",
    "fullName": "Test User",
    "phoneNumber": "+234801234567",
    "addressLine1": "123 Test Street",
    "city": "Lagos",
    "state": "Lagos"
  }'

# Test get states
curl http://localhost:3000/api/locations/states

# Test get LGAs
curl http://localhost:3000/api/locations/states/Lagos/lgas
```

### Mobile Testing

1. Install Expo Location: `expo install expo-location`
2. Grant location permissions in app settings
3. Test address creation with device location
4. Verify state/LGA selection works
5. Test address updates and deletion

## Security Considerations

1. **Authentication**: All address endpoints require valid JWT token
2. **Authorization**: Users can only access their own addresses
3. **Data Validation**: All inputs are validated and sanitized
4. **Soft Delete**: Addresses are soft-deleted for audit trail
5. **Location Privacy**: Device location is optional and user-controlled

## Performance Optimization

1. **Indexing**: userId indexed for fast address queries
2. **Pagination**: Ready for pagination in list endpoints
3. **Caching**: States/LGAs can be cached on mobile
4. **Lazy Loading**: Addresses loaded on demand

## Deployment Notes

1. Ensure MongoDB connection is configured
2. Set JWT_SECRET environment variable
3. Configure CORS for mobile app domain
4. Test location permissions on target devices
5. Verify state/LGA data is properly seeded
