import { Request, Response } from 'express';
import Review from '../models/Review';
import Product from '../models/Product';
import User from '../models/User';

export const createReview = async (req: Request, res: Response) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Product ID, rating, and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.userId);

    const review = await Review.create({
      productId,
      userId: req.userId,
      userName: user?.name || 'Anonymous',
      rating,
      comment,
    });

    await updateProductRating(productId);

    res.status(201).json({
      message: 'Review created successfully',
      review,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({ productId, isFlagged: false })
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments({ productId, isFlagged: false });

    res.json({
      reviews,
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

export const addAdminResponse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ message: 'Response text is required' });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      {
        response,
        responseAt: new Date(),
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({
      message: 'Response added successfully',
      review,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await updateProductRating(review.productId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const updateProductRating = async (productId: any) => {
  const reviews = await Review.find({ productId });
  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, { rating: 0, reviewCount: 0 });
    return;
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: reviews.length,
  });
};
