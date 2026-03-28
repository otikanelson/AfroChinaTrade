import { Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Order from '../models/Order';
import UserAuditLog from '../models/UserAuditLog';
import { AuthRequest } from '../middleware/auth';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      role,
      registrationDateFrom,
      registrationDateTo,
      minSpending,
      maxSpending
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    
    // Date range filtering
    if (registrationDateFrom || registrationDateTo) {
      filter.createdAt = {};
      if (registrationDateFrom) {
        filter.createdAt.$gte = new Date(registrationDateFrom as string);
      }
      if (registrationDateTo) {
        filter.createdAt.$lte = new Date(registrationDateTo as string);
      }
    }

    let users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    // If spending filters are provided, we need to aggregate with orders
    if (minSpending || maxSpending) {
      const spendingFilter: any = {};
      if (minSpending) spendingFilter.$gte = parseFloat(minSpending as string);
      if (maxSpending) spendingFilter.$lte = parseFloat(maxSpending as string);

      const userIds = users.map(user => user._id);
      const userSpending = await Order.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: '$userId', totalSpent: { $sum: '$totalAmount' } } },
        { $match: { totalSpent: spendingFilter } }
      ]);

      const qualifyingUserIds = userSpending.map(item => item._id.toString());
      users = users.filter(user => qualifyingUserIds.includes(user._id.toString()));
    }

    const total = await User.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error',
      message: error.message,
      errorCode: 'USER_FETCH_ERROR'
    });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid user ID format',
        errorCode: 'INVALID_USER_ID'
      });
    }

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    res.json({
      status: 'success',
      data: user
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error',
      message: error.message,
      errorCode: 'USER_FETCH_ERROR'
    });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason, suspensionDuration } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid user ID format',
        errorCode: 'INVALID_USER_ID'
      });
    }

    const validStatuses = ['active', 'suspended', 'blocked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid user status. Must be one of: active, suspended, blocked',
        errorCode: 'INVALID_STATUS'
      });
    }

    // Find the user first to get current status
    const currentUser = await User.findById(id);
    if (!currentUser) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    // Find the admin making the request
    const adminUser = await User.findById(req.userId);
    if (!adminUser) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Admin user not found',
        errorCode: 'ADMIN_NOT_FOUND'
      });
    }

    // Admin restrictions
    // 1. Admin cannot manage their own account
    if (id === req.userId) {
      return res.status(403).json({ 
        status: 'error',
        message: 'You cannot manage your own account',
        errorCode: 'CANNOT_MANAGE_SELF'
      });
    }

    // 2. Admin cannot block other admin accounts (only super_admin can)
    if (currentUser.role === 'admin' && status === 'blocked' && adminUser.role !== 'super_admin') {
      return res.status(403).json({ 
        status: 'error',
        message: 'Only super administrators can block admin accounts',
        errorCode: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Validate suspension requirements
    if (status === 'suspended') {
      if (!reason) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Suspension reason is required when suspending a user',
          errorCode: 'SUSPENSION_REASON_REQUIRED'
        });
      }
      if (!suspensionDuration) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Suspension duration is required when suspending a user',
          errorCode: 'SUSPENSION_DURATION_REQUIRED'
        });
      }
    }

    // Validate blocking requirements
    if (status === 'blocked') {
      if (!reason) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Block reason is required when blocking a user',
          errorCode: 'BLOCK_REASON_REQUIRED'
        });
      }
    }

    // Prepare update data
    const updateData: any = { status };
    
    if (status === 'suspended') {
      updateData.suspensionReason = reason;
      updateData.suspensionDuration = new Date(suspensionDuration);
      // Clear block reason if switching from blocked to suspended
      updateData.blockReason = undefined;
    } else if (status === 'blocked') {
      updateData.blockReason = reason;
      // Clear suspension fields if switching from suspended to blocked
      updateData.suspensionReason = undefined;
      updateData.suspensionDuration = undefined;
    } else {
      // Clear all restriction fields if reactivating
      updateData.suspensionReason = undefined;
      updateData.suspensionDuration = undefined;
      updateData.blockReason = undefined;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after' }
    ).select('-password');

    // Create audit log entry
    const auditAction = status === 'suspended' ? 'suspension' : 
                       status === 'blocked' ? 'block' : 
                       currentUser.status === 'suspended' || currentUser.status === 'blocked' ? 'reactivation' : 
                       'status_change';

    await UserAuditLog.create({
      userId: id,
      adminId: req.userId,
      action: auditAction,
      previousStatus: currentUser.status,
      newStatus: status,
      reason: reason,
      suspensionDuration: status === 'suspended' ? new Date(suspensionDuration) : undefined
    });

    res.json({
      status: 'success',
      message: 'User status updated successfully',
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error',
      message: error.message,
      errorCode: 'USER_UPDATE_ERROR'
    });
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid user ID format',
        errorCode: 'INVALID_USER_ID'
      });
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Verify user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    const orders = await Order.find({ userId: id })
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments({ userId: id });

    res.json({
      status: 'success',
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error',
      message: error.message,
      errorCode: 'USER_ORDERS_FETCH_ERROR'
    });
  }
};

export const getUserActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid user ID format',
        errorCode: 'INVALID_USER_ID'
      });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    const orderCount = await Order.countDocuments({ userId: id });
    const totalSpent = await Order.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // Get recent audit log entries for this user
    const auditLogs = await UserAuditLog.find({ userId: id })
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      status: 'success',
      user,
      activity: {
        orderCount,
        totalSpent: totalSpent[0]?.total || 0,
        joinedAt: user.createdAt,
        lastActive: user.updatedAt,
        auditLogs
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error',
      message: error.message,
      errorCode: 'USER_ACTIVITY_FETCH_ERROR'
    });
  }
};
// Profile management endpoints

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    res.json({
      status: 'success',
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      errorCode: 'PROFILE_FETCH_ERROR'
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, phone, avatar } = req.body;

    // Validate input
    if (name && (name.length < 2 || name.length > 100)) {
      return res.status(400).json({
        status: 'error',
        message: 'Name must be between 2 and 100 characters',
        errorCode: 'INVALID_NAME'
      });
    }

    // Build update object
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || undefined;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: error.message,
        errorCode: 'VALIDATION_ERROR'
      });
    }

    res.status(500).json({
      status: 'error',
      message: error.message,
      errorCode: 'PROFILE_UPDATE_ERROR'
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password and new password are required',
        errorCode: 'MISSING_PASSWORDS'
      });
    }

    // Get user with password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect',
        errorCode: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 8 characters long',
        errorCode: 'WEAK_PASSWORD'
      });
    }

    // Check password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        errorCode: 'WEAK_PASSWORD'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      errorCode: 'PASSWORD_CHANGE_ERROR'
    });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { addresses } = req.body;

    if (!Array.isArray(addresses)) {
      return res.status(400).json({
        status: 'error',
        message: 'Addresses must be an array',
        errorCode: 'INVALID_ADDRESSES'
      });
    }

    // Validate addresses
    for (const address of addresses) {
      if (!address.street || !address.city || !address.state || !address.country || !address.postalCode) {
        return res.status(400).json({
          status: 'error',
          message: 'All address fields are required',
          errorCode: 'INCOMPLETE_ADDRESS'
        });
      }
    }

    // Ensure only one default address
    let hasDefault = false;
    const validatedAddresses = addresses.map((addr: any) => {
      if (addr.isDefault) {
        if (hasDefault) {
          addr.isDefault = false; // Only first default address is kept
        } else {
          hasDefault = true;
        }
      }
      return {
        street: addr.street.trim(),
        city: addr.city.trim(),
        state: addr.state.trim(),
        country: addr.country.trim(),
        postalCode: addr.postalCode.trim(),
        isDefault: addr.isDefault || false
      };
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { addresses: validatedAddresses },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    res.json({
      status: 'success',
      message: 'Addresses updated successfully',
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      errorCode: 'ADDRESS_UPDATE_ERROR'
    });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required to delete account',
        errorCode: 'PASSWORD_REQUIRED'
      });
    }

    // Get user with password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is incorrect',
        errorCode: 'INVALID_PASSWORD'
      });
    }

    // Don't allow admin/super_admin to delete their own account
    if (user.role === 'admin' || user.role === 'super_admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin accounts cannot be deleted',
        errorCode: 'ADMIN_DELETE_FORBIDDEN'
      });
    }

    // Instead of deleting, we'll deactivate the account
    await User.findByIdAndUpdate(userId, { 
      status: 'blocked',
      suspensionReason: 'Account deleted by user'
    });

    res.json({
      status: 'success',
      message: 'Account has been deactivated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      errorCode: 'ACCOUNT_DELETE_ERROR'
    });
  }
};

// Get user notification settings
export const getNotificationSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('notificationSettings');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    res.json({
      status: 'success',
      data: user.notificationSettings
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      errorCode: 'NOTIFICATION_SETTINGS_FETCH_ERROR'
    });
  }
};

// Update user notification settings
export const updateNotificationSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const settings = req.body;

    // Validate settings structure
    const validKeys = [
      'orderUpdates',
      'promotions', 
      'newProducts',
      'priceDrops',
      'newsletter',
      'pushNotifications',
      'emailNotifications',
      'smsNotifications'
    ];

    const invalidKeys = Object.keys(settings).filter(key => !validKeys.includes(key));
    if (invalidKeys.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid settings keys: ${invalidKeys.join(', ')}`,
        errorCode: 'INVALID_SETTINGS_KEYS'
      });
    }

    // Validate that all values are boolean
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value !== 'boolean') {
        return res.status(400).json({
          status: 'error',
          message: `Setting '${key}' must be a boolean value`,
          errorCode: 'INVALID_SETTING_VALUE'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { notificationSettings: settings } },
      { new: true, runValidators: true }
    ).select('notificationSettings');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    res.json({
      status: 'success',
      data: user.notificationSettings,
      message: 'Notification settings updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      errorCode: 'NOTIFICATION_SETTINGS_UPDATE_ERROR'
    });
  }
};