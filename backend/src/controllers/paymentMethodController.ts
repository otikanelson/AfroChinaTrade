import { Response } from 'express';
import PaymentMethod from '../models/PaymentMethod';
import { AuthRequest } from '../middleware/auth';

// Get all payment methods for a user
export const getPaymentMethods = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const methods = await PaymentMethod.find({ userId, isActive: true }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, data: methods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment methods' });
  }
};

// Get a single payment method
export const getPaymentMethod = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const method = await PaymentMethod.findOne({ _id: id, userId });
    if (!method) {
      res.status(404).json({ success: false, message: 'Payment method not found' });
      return;
    }

    res.json({ success: true, data: method });
  } catch (error) {
    console.error('Error fetching payment method:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment method' });
  }
};

// Add a new payment method
export const addPaymentMethod = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { type, cardDetails, mobileMoneyDetails, bankDetails, paypalDetails, isDefault } = req.body;

    // Validate required fields
    if (!type) {
      res.status(400).json({ success: false, message: 'Payment method type is required' });
      return;
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await PaymentMethod.updateMany(
        { userId, _id: { $ne: null } },
        { isDefault: false }
      );
    }

    const newMethod = new PaymentMethod({
      userId,
      type,
      cardDetails,
      mobileMoneyDetails,
      bankDetails,
      paypalDetails,
      isDefault: isDefault || false,
      isActive: true
    });

    await newMethod.save();
    res.status(201).json({ success: true, data: newMethod, message: 'Payment method added successfully' });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ success: false, message: 'Failed to add payment method' });
  }
};

// Update a payment method
export const updatePaymentMethod = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { cardDetails, mobileMoneyDetails, bankDetails, paypalDetails, isDefault } = req.body;

    const method = await PaymentMethod.findOne({ _id: id, userId });
    if (!method) {
      res.status(404).json({ success: false, message: 'Payment method not found' });
      return;
    }

    // If setting as default, unset other defaults
    if (isDefault && !method.isDefault) {
      await PaymentMethod.updateMany(
        { userId, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    if (cardDetails) method.cardDetails = cardDetails;
    if (mobileMoneyDetails) method.mobileMoneyDetails = mobileMoneyDetails;
    if (bankDetails) method.bankDetails = bankDetails;
    if (paypalDetails) method.paypalDetails = paypalDetails;
    if (isDefault !== undefined) method.isDefault = isDefault;

    await method.save();
    res.json({ success: true, data: method, message: 'Payment method updated successfully' });
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ success: false, message: 'Failed to update payment method' });
  }
};

// Delete a payment method
export const deletePaymentMethod = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const method = await PaymentMethod.findOne({ _id: id, userId });
    if (!method) {
      res.status(404).json({ success: false, message: 'Payment method not found' });
      return;
    }

    // If deleting default method, set another as default
    if (method.isDefault) {
      const nextMethod = await PaymentMethod.findOne({ userId, _id: { $ne: id }, isActive: true });
      if (nextMethod) {
        nextMethod.isDefault = true;
        await nextMethod.save();
      }
    }

    method.isActive = false;
    await method.save();

    res.json({ success: true, message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ success: false, message: 'Failed to delete payment method' });
  }
};

// Set default payment method
export const setDefaultPaymentMethod = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const method = await PaymentMethod.findOne({ _id: id, userId });
    if (!method) {
      res.status(404).json({ success: false, message: 'Payment method not found' });
      return;
    }

    // Unset all other defaults
    await PaymentMethod.updateMany(
      { userId, _id: { $ne: id } },
      { isDefault: false }
    );

    method.isDefault = true;
    await method.save();

    res.json({ success: true, data: method, message: 'Default payment method updated' });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({ success: false, message: 'Failed to set default payment method' });
  }
};
