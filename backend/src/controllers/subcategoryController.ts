import { Request, Response } from 'express';
import Subcategory from '../models/Subcategory';
import Category from '../models/Category';
import mongoose from 'mongoose';

// Get all subcategories
export const getSubcategories = async (req: Request, res: Response) => {
  try {
    const { categoryId, categoryName } = req.query;
    
    let filter: any = { isActive: true };
    
    if (categoryId) {
      filter.categoryId = categoryId;
    }
    
    if (categoryName) {
      filter.categoryName = categoryName;
    }
    
    const subcategories = await Subcategory.find(filter)
      .sort({ name: 1 })
      .populate('categoryId', 'name description icon');
    
    res.json({
      success: true,
      data: subcategories,
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subcategories',
    });
  }
};

// Get subcategory by ID
export const getSubcategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subcategory ID',
      });
    }
    
    const subcategory = await Subcategory.findById(id)
      .populate('categoryId', 'name description icon');
    
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        error: 'Subcategory not found',
      });
    }
    
    res.json({
      success: true,
      data: subcategory,
    });
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subcategory',
    });
  }
};

// Create subcategory
export const createSubcategory = async (req: Request, res: Response) => {
  try {
    const { name, description, categoryId, icon, imageUrl } = req.body;
    
    // Validate required fields
    if (!name || !categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Name and category ID are required',
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID',
      });
    }
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }
    
    // Check for duplicate name in the same category
    const existingSubcategory = await Subcategory.findOne({
      categoryId,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
    
    if (existingSubcategory) {
      return res.status(400).json({
        success: false,
        error: 'Subcategory name already exists in this category',
      });
    }
    
    // Create subcategory
    const subcategory = new Subcategory({
      name,
      description,
      categoryId,
      categoryName: category.name,
      icon,
      imageUrl,
      isActive: true,
    });
    
    await subcategory.save();
    
    // Populate the category info before returning
    await subcategory.populate('categoryId', 'name description icon');
    
    res.status(201).json({
      success: true,
      data: subcategory,
    });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subcategory',
    });
  }
};

// Update subcategory
export const updateSubcategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, categoryId, icon, imageUrl, isActive } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subcategory ID',
      });
    }
    
    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        error: 'Subcategory not found',
      });
    }
    
    // If categoryId is being changed, validate and update categoryName
    if (categoryId && categoryId !== subcategory.categoryId.toString()) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category ID',
        });
      }
      
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found',
        });
      }
      
      subcategory.categoryId = categoryId;
      subcategory.categoryName = category.name;
    }
    
    // Check for duplicate name in the same category
    if (name && name !== subcategory.name) {
      const existingSubcategory = await Subcategory.findOne({
        _id: { $ne: id },
        categoryId: subcategory.categoryId,
        name: { $regex: new RegExp(`^${name}$`, 'i') },
      });
      
      if (existingSubcategory) {
        return res.status(400).json({
          success: false,
          error: 'Subcategory name already exists in this category',
        });
      }
      
      subcategory.name = name;
    }
    
    if (description !== undefined) subcategory.description = description;
    if (icon !== undefined) subcategory.icon = icon;
    if (imageUrl !== undefined) subcategory.imageUrl = imageUrl;
    if (isActive !== undefined) subcategory.isActive = isActive;
    
    await subcategory.save();
    
    // Populate the category info before returning
    await subcategory.populate('categoryId', 'name description icon');
    
    res.json({
      success: true,
      data: subcategory,
    });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update subcategory',
    });
  }
};

// Delete subcategory
export const deleteSubcategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subcategory ID',
      });
    }
    
    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        error: 'Subcategory not found',
      });
    }
    
    await Subcategory.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Subcategory deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete subcategory',
    });
  }
};

// Get subcategories by category name (for frontend convenience)
export const getSubcategoriesByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryName } = req.params;
    
    const subcategories = await Subcategory.find({
      categoryName: { $regex: new RegExp(`^${categoryName}$`, 'i') },
      isActive: true,
    }).sort({ name: 1 });
    
    res.json({
      success: true,
      data: subcategories,
    });
  } catch (error) {
    console.error('Error fetching subcategories by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subcategories',
    });
  }
};