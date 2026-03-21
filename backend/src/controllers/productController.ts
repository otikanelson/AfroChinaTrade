import { Request, Response } from 'express';
import Product from '../models/Product';

// Get all products with pagination, filtering, and sorting
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, category, minPrice, maxPrice, minRating, inStock, sortBy } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = { isActive: true };

    if (category) {
      filter.category = category;
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
    }

    // Execute query
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

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

    const product = await Product.findById(id);
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
    const { name, description, price, category, supplierId, stock, images, tags } = req.body;

    // Validate required fields
    if (!name || !description || price === undefined || !category || !supplierId || stock === undefined) {
      res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
        errorCode: 'MISSING_FIELDS',
        fields: {
          name: !name ? 'Name is required' : undefined,
          description: !description ? 'Description is required' : undefined,
          price: price === undefined ? 'Price is required' : undefined,
          category: !category ? 'Category is required' : undefined,
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
      category,
      supplierId,
      stock,
      images: images || [],
      tags: tags || [],
    });

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
    const { name, description, price, category, supplierId, stock, images, tags, isFeatured, isActive } = req.body;

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

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (category !== undefined) updateData.category = category;
    if (supplierId !== undefined) updateData.supplierId = supplierId;
    if (stock !== undefined) updateData.stock = stock;
    if (images !== undefined) updateData.images = images;
    if (tags !== undefined) updateData.tags = tags;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isActive !== undefined) updateData.isActive = isActive;

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
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
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: products,
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
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find({ category: categoryId, isActive: true })
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ category: categoryId, isActive: true });

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
      .populate('supplierId', 'name email');

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
      { new: true, runValidators: true }
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