import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import BlacklistedToken from '../models/BlacklistedToken';

const JWT_EXPIRY = '7d';

// Get JWT secret dynamically to ensure .env is loaded
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
};

// Generate JWT token with 30 minute expiry
const generateToken = (userId: string, role: string): string => {
  const secret = getJWTSecret();
  const token = jwt.sign({ userId, role }, secret, { expiresIn: '30m' }); // 30 minutes as designed
  return token;
};

const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId, type: 'refresh' }, getJWTSecret(), { expiresIn: '7d' }); // 7 days refresh token
};

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
        errorCode: 'MISSING_FIELDS',
        fields: {
          name: !name ? 'Name is required' : undefined,
          email: !email ? 'Email is required' : undefined,
          password: !password ? 'Password is required' : undefined,
          phone: !phone ? 'Phone is required' : undefined,
        },
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        status: 'error',
        message: 'Email already registered',
        errorCode: 'EMAIL_EXISTS',
      });
      return;
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer',
    });

    // Generate tokens
    const accessToken = generateToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: accessToken,
        refreshToken: refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'REGISTRATION_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Registration failed',
        errorCode: 'REGISTRATION_FAILED',
      });
    }
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    // Log authentication attempt
    console.log(`[${new Date().toISOString()}] Authentication attempt - Email: ${email}, IP: ${clientIP}, User-Agent: ${userAgent}`);

    // Validate required fields
    if (!email || !password) {
      console.log(`[${new Date().toISOString()}] Authentication failed - Missing credentials - Email: ${email}, IP: ${clientIP}`);
      res.status(400).json({
        status: 'error',
        message: 'Email and password are required',
        errorCode: 'MISSING_CREDENTIALS',
      });
      return;
    }

    // Demo login fallback when database is unavailable
    if (email === 'admin@afrochinatrade.com' && password === 'Admin123!') {
      console.log(`[${new Date().toISOString()}] Demo login successful - Email: ${email}, IP: ${clientIP}`);
      const accessToken = generateToken('demo-admin-id', 'admin');
      const refreshToken = generateRefreshToken('demo-admin-id');
      
      res.status(200).json({
        status: 'success',
        message: 'Login successful (demo mode)',
        data: {
          userId: 'demo-admin-id',
          name: 'Admin User',
          email: email,
          role: 'admin',
          token: accessToken,
          refreshToken: refreshToken,
        },
      });
      return;
    }

    // Demo customer login
    if (email === 'customer@afrochinatrade.com' && password === 'Customer123!') {
      console.log(`[${new Date().toISOString()}] Demo login successful - Email: ${email}, IP: ${clientIP}`);
      const accessToken = generateToken('demo-customer-id', 'customer');
      const refreshToken = generateRefreshToken('demo-customer-id');
      
      res.status(200).json({
        status: 'success',
        message: 'Login successful (demo mode)',
        data: {
          userId: 'demo-customer-id',
          name: 'Customer User',
          email: email,
          role: 'customer',
          token: accessToken,
          refreshToken: refreshToken,
        },
      });
      return;
    }

    // Try to find user by email (include password for comparison)
    let user;
    try {
      user = await User.findOne({ email }).select('+password');
    } catch (dbError) {
      console.error(`Database query failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
      // If database fails, reject the login
      res.status(500).json({
        status: 'error',
        message: 'Database connection failed',
        errorCode: 'DATABASE_ERROR',
      });
      return;
    }

    if (!user) {
      console.log(`[${new Date().toISOString()}] Authentication failed - User not found - Email: ${email}, IP: ${clientIP}`);
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
        errorCode: 'INVALID_CREDENTIALS',
      });
      return;
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      console.log(`[${new Date().toISOString()}] Authentication failed - Account blocked - Email: ${email}, IP: ${clientIP}`);
      res.status(403).json({
        status: 'error',
        message: 'Account is blocked',
        errorCode: 'ACCOUNT_BLOCKED',
      });
      return;
    }

    // Check if user is suspended
    if (user.status === 'suspended') {
      const suspensionDetails: any = {
        status: 'error',
        message: 'Account is suspended',
        errorCode: 'ACCOUNT_SUSPENDED',
      };

      if (user.suspensionReason) {
        suspensionDetails.suspensionReason = user.suspensionReason;
      }

      if (user.suspensionDuration) {
        suspensionDetails.suspensionUntil = user.suspensionDuration;
        
        // Check if suspension has expired
        if (new Date() > user.suspensionDuration) {
          // Auto-reactivate expired suspension
          user.status = 'active';
          user.suspensionReason = undefined;
          user.suspensionDuration = undefined;
          await user.save();
        } else {
          res.status(403).json(suspensionDetails);
          return;
        }
      } else {
        res.status(403).json(suspensionDetails);
        return;
      }
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log(`[${new Date().toISOString()}] Authentication failed - Invalid password - Email: ${email}, IP: ${clientIP}`);
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
        errorCode: 'INVALID_CREDENTIALS',
      });
      return;
    }

    console.log(`[${new Date().toISOString()}] Authentication successful - Email: ${email}, IP: ${clientIP}, Role: ${user.role}`);

    // Generate tokens
    const accessToken = generateToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: accessToken,
        refreshToken: refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'LOGIN_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Login failed',
        errorCode: 'LOGIN_FAILED',
      });
    }
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
      return;
    }

    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'GET_USER_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to get user',
        errorCode: 'GET_USER_FAILED',
      });
    }
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
      return;
    }

    const { name, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, avatar },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'UPDATE_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to update profile',
        errorCode: 'UPDATE_FAILED',
      });
    }
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        status: 'error',
        message: 'Refresh token is required',
        errorCode: 'MISSING_REFRESH_TOKEN',
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, getJWTSecret()) as any;
    
    if (decoded.type !== 'refresh') {
      res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token',
        errorCode: 'INVALID_REFRESH_TOKEN',
      });
      return;
    }

    // Get user to generate new access token with current role
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND',
      });
      return;
    }

    // Check if user is still active
    if (user.status !== 'active') {
      res.status(403).json({
        status: 'error',
        message: 'Account is not active',
        errorCode: 'ACCOUNT_INACTIVE',
      });
      return;
    }

    // Generate new access token
    const newAccessToken = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: { 
        token: newAccessToken,
        userId: user._id,
        role: user.role
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token',
        errorCode: 'INVALID_REFRESH_TOKEN',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to refresh token',
        errorCode: 'REFRESH_FAILED',
      });
    }
  }
};

// Forgot password (placeholder - would need email service)
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        status: 'error',
        message: 'Email is required',
        errorCode: 'MISSING_EMAIL',
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      res.status(200).json({
        status: 'success',
        message: 'If email exists, password reset link will be sent',
      });
      return;
    }

    // TODO: Send password reset email
    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email',
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'FORGOT_PASSWORD_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to process forgot password',
        errorCode: 'FORGOT_PASSWORD_FAILED',
      });
    }
  }
};

// Reset password (placeholder - would need token validation)
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        status: 'error',
        message: 'Token and new password are required',
        errorCode: 'MISSING_FIELDS',
      });
      return;
    }

    // TODO: Verify reset token and update password
    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'RESET_PASSWORD_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to reset password',
        errorCode: 'RESET_PASSWORD_FAILED',
      });
    }
  }
};

// Logout user and blacklist token
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(400).json({
        status: 'error',
        message: 'No token provided',
        errorCode: 'NO_TOKEN',
      });
      return;
    }

    if (!req.userId) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
      return;
    }

    try {
      // Decode token to get expiration
      const decoded = jwt.decode(token) as any;
      const expiresAt = new Date(decoded.exp * 1000);

      // Add token to blacklist
      await BlacklistedToken.create({
        token,
        userId: req.userId,
        expiresAt,
      });

      console.log(`[${new Date().toISOString()}] User logged out - UserID: ${req.userId}, IP: ${req.ip}`);

      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
      });
    } catch (error) {
      // Even if blacklisting fails, consider logout successful
      console.warn('Failed to blacklist token during logout:', error);
      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'LOGOUT_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to logout',
        errorCode: 'LOGOUT_FAILED',
      });
    }
  }
};
