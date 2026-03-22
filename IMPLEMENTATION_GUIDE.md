# Implementation Guide - Simplified Delivery Address System

## Overview

This guide walks you through the simplified delivery address system that integrates with your existing User model.

## What's Included

### Backend
- Location endpoints for Nigerian states and LGAs
- Updated User model with address fields
- Existing user profile address endpoint

### Mobile
- Address list screen
- Create address screen
- Edit address screen
- State/LGA dropdown selection
- Device location capture

## Quick Start

### 1. Backend Setup

No additional setup needed! The system uses your existing:
- User model (updated with landmark and locationSummary fields)
- User profile address endpoint (`PUT /api/users/profile/addresses`)
- Location endpoints (already implemented)

### 2. Mobile Setup

Install location package:
```bash
cd mobile
expo install expo-location
```

### 3. Test the System

**Backend:**
```bash
cd backend
npm run dev
```

**Mobile:**
```bash
cd mobile
npm start
```

## Form Structure

### Address Form Fields

```
┌─────────────────────────────────┐
│ Street Address (required)       │
├─────────────────────────────────┤
│ State (dropdown, required)      │
├─────────────────────────────────┤
│ Local Government (dropdown)     │
├─────────────────────────────────┤
│ Postal Code (required)          │
├─────────────────────────────────┤
│ [Capture Device Location]       │
│ Location Summary (optional)     │
├─────────────────────────────────┤
│ Landmark (optional)             │
├─────────────────────────────────┤
│ ☐ Set as default address       │
├─────────────────────────────────┤
│ [Add Address] [Cancel]          │
└─────────────────────────────────┘
```

## User Flow

### Adding an Address

1. User navigates to Addresses screen
2. Taps "+" button to add new address
3. Enters street address
4. Selects state from dropdown
5. Selects LGA from dropdown (auto-loads based on state)
6. Enters postal code
7. Optionally taps "Capture Device Location"
8. Optionally enters landmark
9. Optionally checks "Set as default"
10. Taps "Add Address"
11. Address saved to User.addresses

### Editing an Address

1. User taps "Edit" on address card
2. Form pre-populated with existing data
3. Can modify any field
4. Can update location
5. Taps "Save Changes"
6. Address updated in User.addresses

### Managing Addresses

- **Set Default**: Tap "Set Default" on any address
- **Delete**: Tap trash icon and confirm
- **View**: All addresses displayed with street, city, state, postal code

## API Integration

### Fetch Addresses
```typescript
const response = await fetch(`${API_BASE_URL}/users/profile`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const user = await response.json();
const addresses = user.data.addresses;
```

### Add Address
```typescript
const response = await fetch(`${API_BASE_URL}/users/profile/addresses`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    addresses: [...currentAddresses, newAddress]
  })
});
```

### Get States
```typescript
const response = await fetch(`${API_BASE_URL}/locations/states`);
const states = await response.json();
```

### Get LGAs
```typescript
const response = await fetch(`${API_BASE_URL}/locations/states/${state}/lgas`);
const lgas = await response.json();
```

## Device Location

The system captures device location and converts it to a human-readable summary:

```typescript
// Capture location
const location = await Location.getCurrentPositionAsync();

// Reverse geocode to get address
const geocode = await Location.reverseGeocodeAsync({
  latitude: location.coords.latitude,
  longitude: location.coords.longitude
});

// Create summary
const summary = [
  geocode[0].street,
  geocode[0].district,
  geocode[0].city,
  geocode[0].region
].filter(Boolean).join(', ');
```

## State/LGA Selection

### States Available
- Abia, Adamawa, Akwa Ibom, Lagos, Oyo, Kano, and more

### LGA Loading
- States dropdown is searchable
- Selecting a state loads its LGAs
- LGAs dropdown is also searchable
- City field is populated with selected LGA

## Data Validation

### Required Fields
- Street Address (non-empty)
- State (selected)
- Local Government Area (selected)
- Postal Code (non-empty)

### Optional Fields
- Landmark (any text)
- Location Summary (auto-populated)
- Default Address (boolean)

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Please fill in all required fields" | Missing required field | Fill in all required fields |
| "State not found" | Invalid state name | Select from dropdown |
| "Location permission denied" | Permission not granted | Grant location permission |
| "Failed to create address" | Network error | Check connection and try again |

## Testing Scenarios

### Scenario 1: Add Address
1. Navigate to Addresses
2. Tap "+"
3. Enter: "123 Main Street"
4. Select: "Lagos"
5. Select: "Ikoyi"
6. Enter: "100001"
7. Tap "Capture Device Location"
8. Tap "Add Address"
9. Verify address appears in list

### Scenario 2: Edit Address
1. Tap "Edit" on address
2. Change street to "456 Oak Avenue"
3. Tap "Save Changes"
4. Verify address updated

### Scenario 3: Set Default
1. Tap "Set Default" on address
2. Verify "Default" badge appears
3. Verify other addresses lose default badge

### Scenario 4: Delete Address
1. Tap trash icon
2. Confirm deletion
3. Verify address removed from list

## Integration with Checkout

To integrate with checkout:

```typescript
// In checkout screen
const addresses = user.addresses;
const selectedAddress = addresses.find(a => a.isDefault);

// Use selected address for order
const order = {
  items: cartItems,
  deliveryAddress: selectedAddress,
  paymentMethod: selectedPayment
};
```

## Troubleshooting

### State Dropdown Empty
- Verify backend is running
- Check `/api/locations/states` endpoint
- Verify network connection

### LGA Dropdown Empty
- Verify state is selected
- Check state name spelling (case-sensitive)
- Verify `/api/locations/states/:state/lgas` endpoint

### Location Not Captured
- Grant location permission in app settings
- Ensure device has GPS enabled
- Check network connection for reverse geocoding

### Address Not Saving
- Verify user is authenticated
- Check JWT token is valid
- Verify network connection
- Check browser console for errors

## Performance Tips

1. **Cache States/LGAs**: Store in app state after first fetch
2. **Lazy Load Addresses**: Load only when needed
3. **Optimize Queries**: Use indexes on userId
4. **Batch Operations**: Update multiple addresses efficiently

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Users can only access their own addresses
3. **Validation**: All inputs are validated
4. **CORS**: Properly configured for mobile app

## Next Steps

### Phase 1: Testing
- [ ] Test address creation
- [ ] Test address editing
- [ ] Test address deletion
- [ ] Test state/LGA selection
- [ ] Test device location

### Phase 2: Integration
- [ ] Integrate with checkout
- [ ] Display selected address in order
- [ ] Save address with order

### Phase 3: Enhancement
- [ ] Add payment methods
- [ ] Calculate delivery fees
- [ ] Estimate delivery time
- [ ] Track delivery status

## File Reference

### Backend
- `backend/src/models/User.ts` - User model with addresses
- `backend/src/controllers/userController.ts` - Address management
- `backend/src/controllers/locationController.ts` - States/LGAs
- `backend/src/routes/userRoutes.ts` - User routes
- `backend/src/routes/locationRoutes.ts` - Location routes
- `backend/src/data/nigerianStatesLGAs.ts` - States/LGAs data

### Mobile
- `mobile/app/addresses.tsx` - Address list screen
- `mobile/app/addresses/new.tsx` - Create address screen
- `mobile/app/addresses/[id].tsx` - Edit address screen
- `mobile/services/AddressService.ts` - API client

## Documentation

- **DELIVERY_SIMPLIFIED.md** - Complete system documentation
- **CHANGES_SUMMARY.md** - What changed
- **QUICK_START.md** - Quick start guide
- **IMPLEMENTATION_GUIDE.md** - This file

## Support

For issues or questions:
1. Check error messages in console
2. Review troubleshooting section
3. Check documentation files
4. Verify backend is running
5. Check network requests in debugger

---

**Ready to implement?** Start with the Quick Start section and follow the testing scenarios!
