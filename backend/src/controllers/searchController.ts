import { Request, Response } from 'express';
import Product from '../models/Product';
import Order from '../models/Order';
import User from '../models/User';
import multer from 'multer';
import path from 'path';
import { Readable } from 'stream';
import { getCloudinary } from '../config/cloudinary';

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const uploadImageSearch = upload.single('image');

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q, categories, minPrice, maxPrice, minRating, inStock, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 10, 100); // Cap at 100
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { isActive: true };

    // Enhanced search - use regex for better partial matching
    if (q) {
      const searchTerm = q as string;
      filter.$or = [
        // Regex search for partial matches (case-insensitive)
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        // Tag search
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ];
    }

    // Multiple category filtering
    if (categories) {
      const categoryArray = Array.isArray(categories) ? categories : [categories];
      filter.category = { $in: categoryArray };
    }

    // Price range filtering
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice as string);
    }

    // Minimum rating filtering
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating as string) };
    }

    // Stock availability filtering
    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    let query = Product.find(filter)
      .skip(skip)
      .limit(limitNum)
      .populate('supplierId', 'name verified rating logo')
      .select('-specifications -policies') // Exclude heavy fields
      .lean(); // Use lean for faster queries

    // Enhanced search result ranking
    if (q) {
      // Sort by relevance factors since we're using regex
      query = query.sort({ 
        isFeatured: -1,
        rating: -1,
        createdAt: -1 
      });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const [products, total] = await Promise.all([
      query,
      Product.countDocuments(filter)
    ]);

    // Return empty array when no results match
    res.json({
      success: true,
      data: {
        products: products || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: error.message 
      }
    });
  }
};

export const searchOrders = async (req: Request, res: Response) => {
  try {
    const { q, startDate, endDate, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    let filter: any = {};

    // Search by order number, customer name, or customer email
    if (q) {
      // First, try to find users by name or email to get their IDs
      const users = await User.find({
        $or: [
          { name: { $regex: q as string, $options: 'i' } },
          { email: { $regex: q as string, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);

      filter.$or = [
        { orderId: { $regex: q as string, $options: 'i' } },
        { 'deliveryAddress.fullName': { $regex: q as string, $options: 'i' } },
        ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : [])
      ];
    }

    // Date range filtering
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    // Return results with pagination including total count and page info
    res.json({
      success: true,
      data: {
        orders: orders || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: {
        code: 'ORDER_SEARCH_ERROR',
        message: error.message 
      }
    });
  }
};
export const searchByImage = async (req: Request, res: Response) => {
  try {
    const { limit = 20 } = req.query;
    const limitNum = parseInt(limit as string) || 20;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_IMAGE', message: 'No image file provided' }
      });
    }

    // Analyze image using Cloudinary
    const analysis = await analyzeImageWithCloudinary(req.file.buffer);

    // Search products using extracted tags
    const searchResults = await searchProductsByFeatures(analysis, limitNum);

    res.json({
      success: true,
      data: {
        products: searchResults.products,
        confidence: analysis.confidence,
        searchTags: analysis.tags,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'IMAGE_SEARCH_ERROR', message: error.message }
    });
  }
};

/**
 * Analyze image using Cloudinary's AI tagging.
 * Uses `categorization: 'google_tagging'` if the add-on is enabled on your account,
 * otherwise falls back to Cloudinary's built-in color/predominant analysis.
 *
 * To swap in AWS Rekognition later, replace this function body only —
 * the rest of the pipeline (searchProductsByFeatures) stays the same.
 */
async function analyzeImageWithCloudinary(buffer: Buffer): Promise<{
  tags: string[];
  confidence: number;
  colors: string[];
}> {
  const cloudinary = getCloudinary();

  // Upload with only free-tier features: color analysis + image metadata.
  // No paid add-ons (google_tagging, aws_rek_tagging) are used here.
  // When you move to AWS Rekognition, replace this function body only.
  const result = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'afrochinatrade/image-search',
        resource_type: 'image',
        colors: true,          // dominant color palette — free on all plans
        image_metadata: true,  // EXIF/format metadata — free on all plans
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });

  // Extract dominant colors (always available, no add-on needed)
  const colorTags: string[] = [];
  if (result.colors?.length) {
    // Cloudinary returns [['#rrggbb', percentage], ...]
    const names = (result.colors as Array<[string, number]>)
      .slice(0, 4)
      .map(([hex]) => hexToColorName(hex))
      .filter(Boolean);
    colorTags.push(...names);
  }

  // Build search terms from image format/dimensions as weak signals
  // e.g. a very wide image is likely a banner/clothing, square = product shot
  const formatTags: string[] = [];
  if (result.width && result.height) {
    const ratio = result.width / result.height;
    if (ratio > 1.5) formatTags.push('banner', 'clothing', 'fashion');
    else if (ratio < 0.75) formatTags.push('portrait', 'fashion', 'apparel');
    else formatTags.push('product'); // square-ish = typical product photo
  }

  const allTags = [...new Set([...colorTags, ...formatTags])];

  // Clean up: delete the temp upload
  if (result.public_id) {
    cloudinary.uploader.destroy(result.public_id).catch(() => {});
  }

  return {
    tags: allTags,
    confidence: 0.5,
    colors: colorTags,
  };
}

/** Map a hex color to a simple color name for product text search */
function hexToColorName(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2 / 255;

  if (lightness > 0.85) return 'white';
  if (lightness < 0.15) return 'black';
  if (max === min) return 'gray';

  const hue = (() => {
    if (max === r) return ((g - b) / (max - min)) % 6;
    if (max === g) return (b - r) / (max - min) + 2;
    return (r - g) / (max - min) + 4;
  })() * 60;

  const h = hue < 0 ? hue + 360 : hue;
  if (h < 30) return 'red';
  if (h < 60) return 'orange';
  if (h < 90) return 'yellow';
  if (h < 150) return 'green';
  if (h < 210) return 'cyan';
  if (h < 270) return 'blue';
  if (h < 330) return 'purple';
  return 'red';
}

/** Search products using tags extracted from image analysis */
async function searchProductsByFeatures(analysis: { tags: string[]; confidence: number }, limit: number) {
  try {
    const searchQuery = analysis.tags.join(' ');
    const filter: any = { isActive: true };

    if (searchQuery) {
      filter.$text = { $search: searchQuery };
    }

    let query = Product.find(filter)
      .limit(limit)
      .populate('supplierId', 'name email verified rating location responseTime logo');

    query = searchQuery
      ? query.sort({ score: { $meta: 'textScore' } })
      : query.sort({ createdAt: -1 });

    const products = await query;
    return { products: products || [] };
  } catch (error) {
    console.error('Error searching products by features:', error);
    return { products: [] };
  }
}