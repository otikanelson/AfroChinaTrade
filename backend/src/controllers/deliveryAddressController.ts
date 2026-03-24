import { Response } from 'express';
import DeliveryAddress, { IDeliveryAddress } from '../models/DeliveryAddress';
import { AuthRequest } from '../middleware/auth';

// Get all delivery addresses for a user
export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const addresses = await DeliveryAddress.find({
      userId: req.userId,
      isActive: true
    }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: addresses
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch addresses',
      errorCode: 'FETCH_ADDRESSES_ERROR'
    });
  }
};

// Get single address
export const getAddressById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const address = await DeliveryAddress.findOne({
      _id: id,
      userId: req.userId,
      isActive: true
    });

    if (!address) {
      res.status(404).json({
        status: 'error',
        message: 'Address not found',
        errorCode: 'ADDRESS_NOT_FOUND'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: address
    });
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch address',
      errorCode: 'FETCH_ADDRESS_ERROR'
    });
  }
};

// Create new delivery address
export const createAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('📥 [createAddress] Request received');
    console.log('📥 [createAddress] User ID:', req.userId);
    console.log('📥 [createAddress] Body:', JSON.stringify(req.body, null, 2));

    const {
      name,
      type,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      landmark,
      location,
      isDefault
    } = req.body;

    // Validate required fields
    console.log('🔍 [createAddress] Validating fields:');
    console.log('  - addressLine1:', addressLine1 ? '✓' : '✗');
    console.log('  - city:', city ? '✓' : '✗');
    console.log('  - state:', state ? '✓' : '✗');

    const missingFields: Record<string, string> = {};
    if (!addressLine1) missingFields['addressLine1'] = 'Address line 1 is required';
    if (!city) missingFields['city'] = 'City is required';
    if (!state) missingFields['state'] = 'State is required';

    if (Object.keys(missingFields).length > 0) {
      console.log('✗ [createAddress] Validation failed - missing required fields:', missingFields);
      res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
        errorCode: 'MISSING_FIELDS',
        fields: missingFields
      });
      return;
    }

    console.log('✓ [createAddress] Validation passed');

    const newAddress = new DeliveryAddress({
      userId: req.userId,
      name: name?.trim(),
      type: type || 'home',
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2?.trim(),
      city: city.trim(),
      state: state.trim(),
      country: 'Nigeria',
      postalCode: postalCode?.trim(),
      landmark: landmark?.trim(),
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy
      } : undefined,
      isDefault: isDefault || false,
      isActive: true
    });

    console.log('💾 [createAddress] Saving address to database...');
    await newAddress.save();
    console.log('✓ [createAddress] Address saved successfully');

    res.status(201).json({
      status: 'success',
      message: 'Address created successfully',
      data: newAddress
    });
  } catch (error) {
    console.error('✗ [createAddress] Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create address',
      errorCode: 'CREATE_ADDRESS_ERROR'
    });
  }
};

// Update delivery address
export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      landmark,
      location,
      isDefault
    } = req.body;

    const address = await DeliveryAddress.findOne({
      _id: id,
      userId: req.userId,
      isActive: true
    });

    if (!address) {
      res.status(404).json({
        status: 'error',
        message: 'Address not found',
        errorCode: 'ADDRESS_NOT_FOUND'
      });
      return;
    }

    // Update fields
    if (name !== undefined) address.name = name?.trim();
    if (addressLine1) address.addressLine1 = addressLine1.trim();
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2?.trim();
    if (city) address.city = city.trim();
    if (state) address.state = state.trim();
    if (postalCode !== undefined) address.postalCode = postalCode?.trim();
    if (landmark !== undefined) address.landmark = landmark?.trim();
    if (type) address.type = type;
    if (location) {
      address.location = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy
      };
    }
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    res.status(200).json({
      status: 'success',
      message: 'Address updated successfully',
      data: address
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update address',
      errorCode: 'UPDATE_ADDRESS_ERROR'
    });
  }
};

// Delete delivery address (soft delete)
export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const address = await DeliveryAddress.findOne({
      _id: id,
      userId: req.userId,
      isActive: true
    });

    if (!address) {
      res.status(404).json({
        status: 'error',
        message: 'Address not found',
        errorCode: 'ADDRESS_NOT_FOUND'
      });
      return;
    }

    address.isActive = false;
    await address.save();

    res.status(200).json({
      status: 'success',
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete address',
      errorCode: 'DELETE_ADDRESS_ERROR'
    });
  }
};

// Set default address
export const setDefaultAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const address = await DeliveryAddress.findOne({
      _id: id,
      userId: req.userId,
      isActive: true
    });

    if (!address) {
      res.status(404).json({
        status: 'error',
        message: 'Address not found',
        errorCode: 'ADDRESS_NOT_FOUND'
      });
      return;
    }

    // Remove default from all other addresses
    await DeliveryAddress.updateMany(
      { userId: req.userId, _id: { $ne: id } },
      { isDefault: false }
    );

    address.isDefault = true;
    await address.save();

    res.status(200).json({
      status: 'success',
      message: 'Default address updated',
      data: address
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to set default address',
      errorCode: 'SET_DEFAULT_ADDRESS_ERROR'
    });
  }
};
