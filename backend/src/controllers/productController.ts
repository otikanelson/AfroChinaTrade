import { Request, Response } from 'express';
import Product from '../models/Product';
import User from '../models/User';
import { getDatabaseStatus } from '../config/database';
import NotificationService from '../services/NotificationService';

// Get all products with pagination, filtering, and sorting
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check database connection first
    const dbStatus = getDatabaseStatus();
    if (dbStatus !== 'connected') {
      console.warn('⚠️  Database not connected');
      res.status(503).json({
        status: 'error',
        message: 'Database connection unavailable',
        errorCode: 'DATABASE_UNAVAILABLE',
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
          hasNext: false,
          hasPrev: false
        }
      });
      return;
    }

    const { page = 1, limit = 10, category, subcategory, minPrice, maxPrice, minRating, inStock, sortBy, sortOrder, supplierId, isFeatured, isSellerFavorite, tag, discount } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (subcategory) {
      filter.subcategory = subcategory;
    }

    if (supplierId) {
      filter.supplierId = supplierId;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice as string);
    }

    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating as string) };
    }

    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true';
    }

    if (isSellerFavorite !== undefined) {
      filter.isSellerFavorite = isSellerFavorite === 'true';
    }

    if (tag) {
      filter.tags = { $in: [tag] };
    }

    if (discount === 'true') {
      filter.discount = { $gt: 0 };
    }

    // Build sort object — supports both combined (price_asc) and split (sortBy=price&sortOrder=asc) formats
    let sortObj: any = { createdAt: -1 };
    const sortByStr = sortBy as string;
    const sortOrderStr = (sortOrder as string) || 'desc';
    const sortDir = sortOrderStr === 'asc' ? 1 : -1;

    if (sortByStr === 'price_asc' || (sortByStr === 'price' && sortOrderStr === 'asc')) {
      sortObj = { price: 1 };
    } else if (sortByStr === 'price_desc' || (sortByStr === 'price' && sortOrderStr === 'desc')) {
      sortObj = { price: -1 };
    } else if (sortByStr === 'rating' || sortByStr === 'rating_desc') {
      sortObj = { rating: -1 };
    } else if (sortByStr === 'newest' || sortByStr === 'createdAt') {
      sortObj = { createdAt: sortDir };
    } else if (sortByStr === 'name') {
      sortObj = { name: sortDir };
    }

    // Execute query
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate('supplierId', 'name email verified rating location responseTime logo');

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'GET_PRODUCTS_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to get products',
        errorCode: 'GET_PRODUCTS_FAILED',
      });
    }
  }
};

// Get single product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate('supplierId', 'name email verified rating location responseTime logo');
    if (!product) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
        errorCode: 'PRODUCT_NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'GET_PRODUCT_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to get product',
        errorCode: 'GET_PRODUCT_FAILED',
      });
    }
  }
};

// Create new product (admin only)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      categoryId,
      subcategory,
      supplierId, 
      stock, 
      images, 
      tags, 
      isFeatured, 
      isActive, 
      discount, 
      discountExpiresAt,
      specifications, 
      isSellerFavorite,
      policies 
    } = req.body;

    // Validate required fields
    if (!name || !description || price === undefined || (!category && !categoryId) || !supplierId || stock === undefined) {
      res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
        errorCode: 'MISSING_FIELDS',
        fields: {
          name: !name ? 'Name is required' : undefined,
          description: !description ? 'Description is required' : undefined,
          price: price === undefined ? 'Price is required' : undefined,
          category: (!category && !categoryId) ? 'Category is required' : undefined,
          supplierId: !supplierId ? 'Supplier ID is required' : undefined,
          stock: stock === undefined ? 'Stock is required' : undefined,
        },
      });
      return;
    }

    // Validate price and stock
    if (typeof price !== 'number' || price < 0) {
      res.status(400).json({
        status: 'error',
        message: 'Price must be a positive number',
        errorCode: 'INVALID_PRICE',
      });
      return;
    }

    if (typeof stock !== 'number' || stock < 0) {
      res.status(400).json({
        status: 'error',
        message: 'Stock must be a non-negative number',
        errorCode: 'INVALID_STOCK',
      });
      return;
    }

    const product = await Product.create({
      name,
      description,
      price,
      category: category || categoryId,
      subcategory,
      supplierId,
      stock,
      images: images || [],
      tags: tags || [],
      isFeatured: isFeatured || false,
      isActive: isActive !== undefined ? isActive : true,
      discount: discount || 0,
      discountExpiresAt: discountExpiresAt || undefined,
      specifications: specifications || {},
      isSellerFavorite: isSellerFavorite || false,
      policies: policies || {},
    });

    // Send notification to users who opted in for new product notifications
    if (product.isActive) {
      NotificationService.sendNewProductNotification(
        product.name,
        product._id.toString(),
        category || 'Product',
        product.price
      ).catch(error => {
        console.error('Failed to send new product notification:', error);
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'CREATE_PRODUCT_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to create product',
        errorCode: 'CREATE_PRODUCT_FAILED',
      });
    }
  }
};

// Update product (admin only)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, category, categoryId, subcategory, supplierId, stock, images, tags, isFeatured, isActive, discount, discountExpiresAt, specifications, isSellerFavorite, policies } = req.body;

    // Validate price if provided
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      res.status(400).json({
        status: 'error',
        message: 'Price must be a positive number',
        errorCode: 'INVALID_PRICE',
      });
      return;
    }

    // Validate stock if provided
    if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
      res.status(400).json({
        status: 'error',
        message: 'Stock must be a non-negative number',
        errorCode: 'INVALID_STOCK',
      });
      return;
    }

    // Validate discount if provided
    if (discount !== undefined && (typeof discount !== 'number' || discount < 0 || discount > 100)) {
      res.status(400).json({
        status: 'error',
        message: 'Discount must be a number between 0 and 100',
        errorCode: 'INVALID_DISCOUNT',
      });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (category !== undefined || categoryId !== undefined) updateData.category = category || categoryId;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (supplierId !== undefined) updateData.supplierId = supplierId;
    if (stock !== undefined) updateData.stock = stock;
    if (images !== undefined) updateData.images = images;
    if (tags !== undefined) updateData.tags = tags;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (discount !== undefined) updateData.discount = discount;
    if (discountExpiresAt !== undefined) updateData.discountExpiresAt = discountExpiresAt;
    if (specifications !== undefined) updateData.specifications = specifications;
    if (isSellerFavorite !== undefined) updateData.isSellerFavorite = isSellerFavorite;
    if (policies !== undefined) updateData.policies = policies;

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );

    if (!product) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
        errorCode: 'PRODUCT_NOT_FOUND',
      });
      return;
    }

    // Check if discount was added or increased
    if (discount !== undefined && product.isActive) {
      const originalProduct = await Product.findById(id);
      const oldDiscount = originalProduct?.discount || 0;
      
      if (discount > oldDiscount && discount > 0) {
        // Send discount notification
        try {
          const users = await User.find({
            'notificationSettings.discountedProducts': true,
            status: 'active'
          }).select('_id');
          
          const userIds = users.map(user => user._id.toString());
          
          if (userIds.length > 0) {
            const originalPrice = product.price;
            const discountedPrice = originalPrice * (1 - discount / 100);
            
            await NotificationService.sendDiscountedProductNotification(
              userIds,
              product.name,
              product._id.toString(),
              originalPrice,
              discountedPrice,
              discount
            );
          }
        } catch (error) {
          console.error('Failed to send discount notification:', error);
        }
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'UPDATE_PRODUCT_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to update product',
        errorCode: 'UPDATE_PRODUCT_FAILED',
      });
    }
  }
};

// Delete product (admin only)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
        errorCode: 'PRODUCT_NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'DELETE_PRODUCT_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete product',
        errorCode: 'DELETE_PRODUCT_FAILED',
      });
    }
  }
};

// Get featured products
export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));

    const products = await Product.find({ isFeatured: true, isActive: true })
      .limit(limitNum)
      .sort({ createdAt: -1 })
      .populate('supplierId', 'name email verified rating location responseTime logo');

    const total = await Product.countDocuments({ isFeatured: true, isActive: true });

    res.status(200).json({
      status: 'success',
      data: products,
      pagination: {
        page: 1,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: limitNum < total,
        hasPrev: false
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'GET_FEATURED_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to get featured products',
        errorCode: 'GET_FEATURED_FAILED',
      });
    }
  }
};

// Get products by category
export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10, subcategory } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = { category: categoryId, isActive: true };
    
    // Add subcategory filter if provided
    if (subcategory && typeof subcategory === 'string') {
      filter.subcategory = subcategory;
    }

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 })
      .populate('supplierId', 'name email verified rating location responseTime logo');

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'GET_CATEGORY_PRODUCTS_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to get category products',
        errorCode: 'GET_CATEGORY_PRODUCTS_FAILED',
      });
    }
  }
};
// Admin-specific functions

// Get all products for admin (including inactive ones)
export const getAdminProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, category, status, sortBy } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build filter object (no isActive filter for admin)
    const filter: any = {};

    if (category) {
      filter.category = category;
    }

    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }
    // If status is not specified, show all products

    // Build sort object
    let sortObj: any = { createdAt: -1 };
    if (sortBy === 'price_asc') {
      sortObj = { price: 1 };
    } else if (sortBy === 'price_desc') {
      sortObj = { price: -1 };
    } else if (sortBy === 'rating') {
      sortObj = { rating: -1 };
    } else if (sortBy === 'newest') {
      sortObj = { createdAt: -1 };
    } else if (sortBy === 'name') {
      sortObj = { name: 1 };
    }

    // Execute query
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate('supplierId', 'name email logo');

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'GET_ADMIN_PRODUCTS_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to get admin products',
        errorCode: 'GET_ADMIN_PRODUCTS_FAILED',
      });
    }
  }
};

// Toggle product active status
export const toggleProductStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      res.status(400).json({
        status: 'error',
        message: 'isActive must be a boolean value',
        errorCode: 'INVALID_STATUS',
      });
      return;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive },
      { returnDocument: 'after', runValidators: true }
    );

    if (!product) {
      res.status(404).json({
        status: 'error',
        message: 'Product not found',
        errorCode: 'PRODUCT_NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: `Product ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: product,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'TOGGLE_STATUS_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to toggle product status',
        errorCode: 'TOGGLE_STATUS_FAILED',
      });
    }
  }
};