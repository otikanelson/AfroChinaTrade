# Simplified Delivery Address System

## Overview

The delivery address system has been simplified to work with your existing User model addresses endpoint. Users can now add delivery addresses with state/LGA selection and optional device location summary.

## What Changed

### Removed
- Personal details (fullName, phoneNumber) - not needed
- Address type selector (home/work/other) - simplified
- Latitude/longitude coordinates - replaced with location summary
- Separate DeliveryAddress collection - using existing User.addresses

### Added
- State and LGA dropdown selectors
- Device location summary (human-readable address)
- Landmark field for delivery instructions
- Location summary field for captured location

## Backend Updates

### User Model (`backend/src/models/User.ts`)
Updated IAddress interface to include:
```typescript
interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  landmark?: string;           // NEW
  locationSummary?: string;    // NEW
}
```

### Existing Endpoints Used
- `PUT /api/users/profile/addresses` - Add/update/delete addresses
- `GET /api/users/profile` - Fetch user with addresses
- `GET /api/locations/states` - Get Nigerian states
- `GET /api/locations/states/:state/lgas` - Get LGAs for state

## Mobile Implementation

### Address List Screen (`mobile/app/addresses.tsx`)
- Displays all user addresses
- Add new address button
- Edit and delete functionality
- Set default address
- Shows landmark and location summary

### Create Address Screen (`mobile/app/addresses/new.tsx`)
- Street address input
- State dropdown (searchable)
- LGA dropdown (searchable, loads based on state)
- Postal code input
- Device location capture (shows summary)
- Landmark field
- Default address checkbox
- Saves to existing User.addresses endpoint

### Edit Address Screen (`mobile/app/addresses/[id].tsx`)
- Pre-populated form with existing address data
- All creation features available
- Update location capability
- Save changes to User.addresses

## Form Fields

### Required
- Street Address
- State (dropdown)
- Local Government Area (dropdown)
- Postal Code

### Optional
- Landmark (e.g., "Near the market")
- Location Summary (auto-captured from device)
- Default Address (checkbox)

## API Integration

### Create/Update Address
```bash
PUT /api/users/profile/addresses
{
  "addresses": [
    {
      "street": "123 Main Street",
      "city": "Ikoyi",
      "state": "Lagos",
      "country": "Nigeria",
      "postalCode": "100001",
      "isDefault": true,
      "landmark": "Near the market",
      "locationSummary": "123 Main Street, Ikoyi, Lagos"
    }
  ]
}
```

### Get Addresses
```bash
GET /api/users/profile
# Returns user object with addresses array
```

## Device Location

Instead of storing raw coordinates, the system now:
1. Captures device GPS location
2. Uses reverse geocoding to get human-readable address
3. Stores as `locationSummary` (e.g., "123 Main Street, Ikoyi, Lagos")
4. Falls back to coordinates if reverse geocoding fails

## State/LGA Selection

### Available States
- Abia, Adamawa, Akwa Ibom, Lagos, Oyo, Kano, and more

### LGA Loading
- States dropdown is searchable
- Selecting a state loads its LGAs
- LGAs dropdown is also searchable
- City field is populated with selected LGA

## File Structure

```
backend/src/
├── models/
│   └── User.ts (UPDATED - added landmark, locationSummary)
├── controllers/
│   └── userController.ts (existing - updateAddress)
├── routes/
│   └── userRoutes.ts (existing - PUT /profile/addresses)
├── data/
│   └── nigerianStatesLGAs.ts (NEW - states/LGAs data)
└── index.ts (UPDATED - added location routes)

mobile/app/
├── addresses.tsx (UPDATED - simplified)
├── addresses/
│   ├── new.tsx (NEW - simplified form)
│   └── [id].tsx (NEW - simplified edit)
└── services/
    └── AddressService.ts (existing)
```

## Usage Flow

### Add Address
1. User taps "Add Address" button
2. Fills in street address
3. Selects state from dropdown
4. Selects LGA from dropdown
5. Enters postal code
6. Optionally captures device location
7. Optionally adds landmark
8. Optionally sets as default
9. Taps "Add Address"
10. Address saved to User.addresses

### Edit Address
1. User taps "Edit" on address card
2. Form pre-populated with existing data
3. Can modify any field
4. Can update location
5. Taps "Save Changes"
6. Address updated in User.addresses

### Set Default
1. User taps "Set Default" on address
2. Only one address can be default
3. Immediately updates

### Delete Address
1. User taps trash icon
2. Confirms deletion
3. Address removed from User.addresses

## Testing

### Backend
```bash
# Get user profile with addresses
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer TOKEN"

# Get states
curl http://localhost:3000/api/locations/states

# Get LGAs for Lagos
curl http://localhost:3000/api/locations/states/Lagos/lgas
```

### Mobile
1. Navigate to Addresses screen
2. Add new address with all fields
3. Verify state/LGA selection works
4. Test device location capture
5. Edit address
6. Set as default
7. Delete address

## Data Storage

Addresses are stored in User model:
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  addresses: [
    {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      isDefault: Boolean,
      landmark: String,
      locationSummary: String
    }
  ]
}
```

## Benefits

1. **Simplified** - No personal details needed
2. **Integrated** - Uses existing User.addresses endpoint
3. **User-friendly** - Dropdown selection for states/LGAs
4. **Location-aware** - Captures device location as summary
5. **Flexible** - Optional landmark and location fields
6. **Maintainable** - Fewer models and endpoints

## Next Steps

### Payment Methods
1. Create PaymentMethod model
2. Add payment routes/controller
3. Integrate Paystack API
4. Update checkout to select payment method

### Delivery Integration
1. Link addresses to orders
2. Calculate delivery fees by state/LGA
3. Estimate delivery time
4. Track delivery status

## Troubleshooting

| Issue | Solution |
|-------|----------|
| State dropdown empty | Verify `/api/locations/states` endpoint works |
| LGA dropdown empty | Check state name spelling (case-sensitive) |
| Location not captured | Grant location permission in app settings |
| Address not saving | Verify user is authenticated with valid token |
| Edit not working | Check address index is correct |

## Notes

- All addresses are stored in User model (no separate collection)
- Only one default address per user (enforced by frontend)
- Location summary is optional (can be empty)
- Landmark is optional (can be empty)
- Country is always "Nigeria"
- All addresses are active (no soft delete)

---

**Status**: ✅ Complete and Ready for Testing

The simplified delivery system is fully implemented and ready for integration testing with your existing User model.
