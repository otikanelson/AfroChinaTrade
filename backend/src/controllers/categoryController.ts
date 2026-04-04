import { Request, Response } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    // Get product counts for all categories in a single aggregation query
    const productCounts = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Create a map for quick lookup
    const countMap = new Map(productCounts.map(pc => [pc._id, pc.count]));

    // Attach counts to categories
    const categoriesWithCount = categories.map(cat => ({
      ...cat.toObject(),
      productCount: countMap.get(cat.name) || 0,
    }));

    res.json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ 
        success: false,
        error: 'Category not found' 
      });
    }

    const productCount = await Product.countDocuments({ category: category.name });

    res.json({
      success: true,
      data: {
        ...category.toObject(),
        productCount,
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, icon, imageUrl, subcategories } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false,
        error: 'Category name is required' 
      });
    }

    if (!subcategories || !Array.isArray(subcategories) || subcategories.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'At least one subcategory is required' 
      });
    }

    // Validate subcategories are non-empty strings
    const validSubcategories = subcategories.filter(sub => 
      typeof sub === 'string' && sub.trim().length > 0
    );

    if (validSubcategories.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'At least one valid subcategory is required' 
      });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(409).json({ 
        success: false,
        error: 'Category already exists' 
      });
    }

    const category = await Category.create({
      name,
      description,
      icon,
      imageUrl,
      subcategories: validSubcategories,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, icon, imageUrl, subcategories, isActive } = req.body;

    if (subcategories !== undefined) {
      if (!Array.isArray(subcategories) || subcategories.length === 0) {
        return res.status(400).json({ 
          success: false,
          error: 'At least one subcategory is required' 
        });
      }

      // Validate subcategories are non-empty strings
      const validSubcategories = subcategories.filter(sub => 
        typeof sub === 'string' && sub.trim().length > 0
      );

      if (validSubcategories.length === 0) {
        return res.status(400).json({ 
          success: false,
          error: 'At least one valid subcategory is required' 
        });
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name, description, icon, imageUrl, subcategories, isActive },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ 
        success: false,
        error: 'Category not found' 
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ 
        success: false,
        error: 'Category not found' 
      });
    }

    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return res.status(409).json({ 
        success: false,
        error: 'Cannot delete category with assigned products' 
      });
    }

    await Category.findByIdAndDelete(id);

    res.json({ 
      success: true,
      message: 'Category deleted successfully' 
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

export const getCategoryProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ 
        success: false,
        error: 'Category not found' 
      });
    }

    const products = await Product.find({ category: category.name, isActive: true })
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments({ category: category.name, isActive: true });

    res.json({
      success: true,
      data: {
        products,
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
      success: false,
      error: error.message 
    });
  }
};
