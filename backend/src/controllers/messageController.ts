import { Request, Response } from 'express';
import Message from '../models/Message';
import MessageThread from '../models/MessageThread';
import User from '../models/User';
import PushDeliveryService from '../services/PushDeliveryService';

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { threadId, text, recipientId, productId, productImage, productName, threadType = 'general' } = req.body;

    if (!threadId || !text) {
      return res.status(400).json({ 
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Thread ID and message text are required'
        }
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Check if thread exists
    let thread = await MessageThread.findOne({ threadId });
    
    // If thread doesn't exist, create it
    if (!thread) {
      let recipient = null;
      
      if (recipientId) {
        recipient = await User.findById(recipientId);
        if (!recipient) {
          return res.status(404).json({ 
            success: false,
            error: {
              code: 'RECIPIENT_NOT_FOUND',
              message: 'Recipient not found'
            }
          });
        }
      } else {
        // If no recipientId provided, find any admin user for general support
        recipient = await User.findOne({ role: 'admin' });
        if (!recipient) {
          return res.status(404).json({ 
            success: false,
            error: {
              code: 'NO_ADMIN_FOUND',
              message: 'No admin users available to handle your message'
            }
          });
        }
      }

      // Get product info if productId is provided but productName/productImage aren't
      let finalProductName = productName;
      let finalProductImage = productImage;
      
      if (productId && (!productName || !productImage)) {
        const Product = require('../models/Product').default;
        const product = await Product.findById(productId);
        if (product) {
          finalProductName = finalProductName || product.name;
          finalProductImage = finalProductImage || (product.images && product.images.length > 0 ? product.images[0] : undefined);
        }
      }

      // Map new message types to existing thread types
      let mappedThreadType = threadType;
      if (threadType === 'inquiry') {
        mappedThreadType = 'product_inquiry';
      } else if (threadType === 'quotation') {
        mappedThreadType = 'quote_request';
      }

      thread = await MessageThread.create({
        threadId,
        customerId: user.role === 'customer' ? req.userId : recipient._id,
        customerName: user.role === 'customer' ? user.name : recipient.name,
        productId: productId || undefined,
        productName: finalProductName,
        productImage: finalProductImage,
        threadType: mappedThreadType,
        lastMessage: text,
        lastMessageAt: new Date(),
        unreadCount: user.role === 'customer' ? 0 : 1
      });
    }

    // If thread still doesn't exist, return error (this shouldn't happen now)
    if (!thread) {
      return res.status(500).json({ 
        success: false,
        error: {
          code: 'THREAD_CREATION_FAILED',
          message: 'Failed to create or find thread'
        }
      });
    }

    // Verify user can access this thread
    if (thread.customerId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to send messages in this thread'
        }
      });
    }

    const message = await Message.create({
      threadId,
      senderId: req.userId,
      senderName: user.name,
      senderRole: user.role,
      text,
      productId: thread.productId || undefined,
      productImage: thread.productImage || undefined,
      productName: thread.productName || undefined,
    });

    // Update thread with last message info and increment unread count appropriately
    const updateData: any = {
      lastMessage: text,
      lastMessageAt: new Date(),
    };

    // Increment unread count if the sender is not the customer (i.e., admin is replying)
    if (user.role === 'admin') {
      updateData.$inc = { unreadCount: 1 };
    } else {
      // Reset unread count when customer sends a message (they've seen their own message)
      updateData.unreadCount = 0;
    }

    await MessageThread.findOneAndUpdate(
      { threadId },
      updateData
    );

    // Send push notification to the recipient (fire-and-forget)
    try {
      // Determine recipient: if sender is customer, recipient is admin; if sender is admin, recipient is customer
      let recipientId: string | undefined;
      
      if (user.role === 'customer') {
        // Customer sent message, notify admin
        // Find any admin user (in practice, all admins will get notified via their tokens)
        const adminUser = await User.findOne({ role: 'admin' });
        if (adminUser) {
          recipientId = adminUser._id.toString();
        }
      } else {
        // Admin sent message, notify the customer
        recipientId = thread.customerId.toString();
      }
      
      // Skip push if sender === recipient (shouldn't happen, but safety check)
      if (recipientId && recipientId !== req.userId) {
        PushDeliveryService.send({
          userIds: [recipientId],
          title: 'New Message',
          body: 'You have new messages',
          data: {
            screen: 'message-thread',
            threadId: thread.threadId,
          },
          // No settingKey - message pushes are not gated by orderUpdates or promotions
        }).catch(err => {
          console.error('[createMessage] Push notification failed:', err);
        });
      }
    } catch (pushError) {
      // Log but don't fail the request
      console.error('[createMessage] Error sending push notification:', pushError);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error: any) {
    console.error('Error in createMessage:', error);
    res.status(500).json({ 
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};

export const getThreads = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, threadType } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 10, 100); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;

    // For customers, show their own threads. For admins, show all threads
    const filter: any = req.userRole === 'admin' ? {} : { customerId: req.userId };
    
    // Add thread type filter if provided
    if (threadType) {
      filter.threadType = threadType;
    }

    const threads = await MessageThread.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ lastMessageAt: -1 });

    // Calculate unread count for each thread
    const threadsWithUnreadCount = await Promise.all(
      threads.map(async (thread) => {
        let unreadCount = 0;
        
        if (req.userRole === 'admin') {
          // For admin, count unread messages from customers
          unreadCount = await Message.countDocuments({
            threadId: thread.threadId,
            senderRole: 'customer',
            isRead: false
          });
        } else {
          // For customers, count unread messages from admins
          unreadCount = await Message.countDocuments({
            threadId: thread.threadId,
            senderRole: 'admin',
            isRead: false
          });
        }

        return {
          ...thread.toObject(),
          unreadCount
        };
      })
    );

    const total = await MessageThread.countDocuments(filter);

    res.json({
      success: true,
      data: threadsWithUnreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};

export const getThreadMessages = async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 20, 100); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;

    const thread = await MessageThread.findOne({ threadId });
    if (!thread) {
      return res.status(404).json({ 
        success: false,
        error: {
          code: 'THREAD_NOT_FOUND',
          message: 'Thread not found'
        }
      });
    }

    // Verify user can access this thread
    if (thread.customerId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to access this thread'
        }
      });
    }

    const messages = await Message.find({ threadId })
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: 1 }); // Oldest first for chat display

    const total = await Message.countDocuments({ threadId });

    res.json({
      success: true,
      data: {
        thread: {
          threadId: thread.threadId,
          customerId: thread.customerId,
          customerName: thread.customerName,
          productName: thread.productName,
          threadType: thread.threadType,
          status: thread.status
        },
        messages
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ 
        success: false,
        error: {
          code: 'MESSAGE_NOT_FOUND',
          message: 'Message not found'
        }
      });
    }

    // Verify user can mark this message as read
    // Users can only mark messages they received as read
    if (message.senderId.toString() === req.userId) {
      return res.status(400).json({ 
        success: false,
        error: {
          code: 'INVALID_OPERATION',
          message: 'Cannot mark your own message as read'
        }
      });
    }

    // Check if user has access to this thread
    const thread = await MessageThread.findOne({ threadId: message.threadId });
    if (!thread) {
      return res.status(404).json({ 
        success: false,
        error: {
          code: 'THREAD_NOT_FOUND',
          message: 'Thread not found'
        }
      });
    }

    if (thread.customerId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to mark this message as read'
        }
      });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { isRead: true },
      { returnDocument: 'after' }
    );

    res.json({
      success: true,
      message: 'Message marked as read',
      data: updatedMessage,
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    let unreadCount = 0;

    if (req.userRole === 'admin') {
      // For admin, count unread messages from customers across all threads
      unreadCount = await Message.countDocuments({
        senderRole: 'customer',
        isRead: false,
      });
    } else {
      // For customers, count unread messages from admins in their threads
      const userThreads = await MessageThread.find({ customerId: req.userId });
      const threadIds = userThreads.map(thread => thread.threadId);
      
      unreadCount = await Message.countDocuments({
        threadId: { $in: threadIds },
        senderRole: 'admin',
        isRead: false,
      });
    }

    res.json({ 
      success: true,
      data: { unreadCount }
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};

export const createProductThread = async (req: Request, res: Response) => {
  try {
    const { productId, initialMessage, threadType = 'product_inquiry' } = req.body;

    if (!productId || !initialMessage) {
      return res.status(400).json({ 
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Product ID and initial message are required'
        }
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Get product info
    const Product = require('../models/Product').default;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    // Generate unique thread ID
    const threadId = `${user._id}_${productId}_${Date.now()}`;

    // Create thread
    const thread = await MessageThread.create({
      threadId,
      customerId: req.userId,
      customerName: user.name,
      productId,
      productName: product.name,
      threadType,
      lastMessage: '',
      lastMessageAt: new Date(),
      unreadCount: 0
    });

    res.status(201).json({
      success: true,
      message: 'Product thread created successfully',
      data: {
        thread,
        isExisting: false
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};

export const clearHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    // For customers, only delete their own threads
    // For admins, delete all threads
    const filter = userRole === 'admin' ? {} : { customerId: userId };

    // First, get all thread IDs that will be deleted
    const threadsToDelete = await MessageThread.find(filter).distinct('threadId');

    // Delete all messages in those threads
    const messageResult = await Message.deleteMany(
      userRole === 'admin' 
        ? {} 
        : { threadId: { $in: threadsToDelete } }
    );

    // Delete all message threads
    const threadResult = await MessageThread.deleteMany(filter);

    res.json({
      success: true,
      message: 'Message history cleared successfully',
      data: {
        threadsDeleted: threadResult.deletedCount,
        messagesDeleted: messageResult.deletedCount
      }
    });
  } catch (error: any) {
    console.error('Error clearing message history:', error);
    res.status(500).json({ 
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};
