import { Request, Response } from 'express';
import Supplier from '../models/Supplier';
import SupplierReview from '../models/SupplierReview';

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, verified } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (verified === 'true') {
      filter.verified = true;
    }

    const suppliers = await Supplier.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ name: 1 });

    const total = await Supplier.countDocuments(filter);

    res.json({
      status: 'success',
      data: suppliers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSupplierById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({
      status: 'success',
      data: supplier,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, location, logo, description, website, responseTime } = req.body;

    if (!name || !email || !phone || !address || !location) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      return res.status(409).json({ message: 'Supplier with this email already exists' });
    }

    const supplier = await Supplier.create({
      name,
      email,
      phone,
      address,
      location,
      logo,
      description,
      website,
      responseTime,
    });

    res.status(201).json({
      message: 'Supplier created successfully',
      supplier,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, address, location, logo, description, website, verified, rating, responseTime } = req.body;

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { name, phone, address, location, logo, description, website, verified, rating, responseTime },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({
      message: 'Supplier updated successfully',
      supplier,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByIdAndDelete(id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Supplier Review endpoints
export const createSupplierReview = async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if supplier exists
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Check if user already reviewed this supplier
    const existingReview = await SupplierReview.findOne({ supplierId, userId });
    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this supplier' });
    }

    // Create the review
    const review = await SupplierReview.create({
      supplierId,
      userId,
      rating,
      comment,
    });

    // Update supplier's rating and review count
    const reviews = await SupplierReview.find({ supplierId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;

    await Supplier.findByIdAndUpdate(supplierId, {
      rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
      reviewCount: reviews.length,
    });

    res.status(201).json({
      message: 'Review created successfully',
      review,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSupplierReviews = async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const reviews = await SupplierReview.find({ supplierId })
      .populate('userId', 'name avatar')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await SupplierReview.countDocuments({ supplierId });

    res.json({
      status: 'success',
      data: reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSupplierReview = async (req: Request, res: Response) => {
  try {
    const { supplierId, reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Find and update the review
    const review = await SupplierReview.findOneAndUpdate(
      { _id: reviewId, supplierId, userId },
      { rating, comment },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    // Recalculate supplier's rating
    const reviews = await SupplierReview.find({ supplierId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;

    await Supplier.findByIdAndUpdate(supplierId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
    });

    res.json({
      message: 'Review updated successfully',
      review,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
