import { Request, Response } from 'express';
import multer from 'multer';
import { getCloudinary, validateCloudinaryConfig } from '../config/cloudinary';
import { Readable } from 'stream';

// Configure multer for memory storage (we'll upload to Cloudinary)
const storage = multer.memoryStorage();

// File filter to validate image types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

// Configure multer with options
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (Cloudinary free tier supports up to 10MB)
  },
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer: Buffer, options: any = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    const cloudinary = getCloudinary();
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'afrochinatrade', // Organize uploads in a folder
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }, // Optimize images
        ],
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Create a readable stream from buffer and pipe to Cloudinary
    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

// Upload single image
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate Cloudinary configuration
    if (!validateCloudinaryConfig()) {
      res.status(500).json({
        status: 'error',
        message: 'Cloudinary configuration is missing',
        errorCode: 'CLOUDINARY_CONFIG_ERROR',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        status: 'error',
        message: 'No file uploaded',
        errorCode: 'NO_FILE',
      });
      return;
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`, // Unique filename
    });

    res.status(200).json({
      status: 'success',
      message: 'Image uploaded successfully',
      data: {
        filename: result.public_id,
        originalName: req.file.originalname,
        size: req.file.size,
        url: result.secure_url,
        cloudinaryId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'UPLOAD_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to upload image',
        errorCode: 'UPLOAD_FAILED',
      });
    }
  }
};

// Upload multiple images
export const uploadMultipleImages = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate Cloudinary configuration
    if (!validateCloudinaryConfig()) {
      res.status(500).json({
        status: 'error',
        message: 'Cloudinary configuration is missing',
        errorCode: 'CLOUDINARY_CONFIG_ERROR',
      });
      return;
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'No files uploaded',
        errorCode: 'NO_FILES',
      });
      return;
    }

    // Upload all files to Cloudinary
    const uploadPromises = req.files.map(async (file: Express.Multer.File) => {
      const result = await uploadToCloudinary(file.buffer, {
        public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`,
      });

      return {
        filename: result.public_id,
        originalName: file.originalname,
        size: file.size,
        url: result.secure_url,
        cloudinaryId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.status(200).json({
      status: 'success',
      message: `${uploadedFiles.length} images uploaded successfully`,
      data: uploadedFiles,
    });
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'UPLOAD_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to upload images',
        errorCode: 'UPLOAD_FAILED',
      });
    }
  }
};

// Delete image from Cloudinary
export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate Cloudinary configuration
    if (!validateCloudinaryConfig()) {
      res.status(500).json({
        status: 'error',
        message: 'Cloudinary configuration is missing',
        errorCode: 'CLOUDINARY_CONFIG_ERROR',
      });
      return;
    }

    const { cloudinaryId } = req.params;

    if (!cloudinaryId) {
      res.status(400).json({
        status: 'error',
        message: 'Cloudinary ID is required',
        errorCode: 'MISSING_CLOUDINARY_ID',
      });
      return;
    }

    // Delete from Cloudinary
    const cloudinary = getCloudinary();
    const result = await cloudinary.uploader.destroy(cloudinaryId);

    if (result.result === 'ok') {
      res.status(200).json({
        status: 'success',
        message: 'Image deleted successfully',
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Image not found or already deleted',
        errorCode: 'IMAGE_NOT_FOUND',
      });
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'DELETE_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete image',
        errorCode: 'DELETE_FAILED',
      });
    }
  }
};

// Multer error handler middleware
export const handleMulterError = (error: any, req: Request, res: Response, next: any): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        status: 'error',
        message: 'File too large. Maximum size is 10MB.',
        errorCode: 'FILE_TOO_LARGE',
      });
      return;
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        status: 'error',
        message: 'Too many files. Maximum 10 files allowed.',
        errorCode: 'TOO_MANY_FILES',
      });
      return;
    }

    res.status(400).json({
      status: 'error',
      message: error.message,
      errorCode: 'UPLOAD_ERROR',
    });
    return;
  }

  if (error.message.includes('Invalid file type')) {
    res.status(400).json({
      status: 'error',
      message: error.message,
      errorCode: 'INVALID_FILE_TYPE',
    });
    return;
  }

  next(error);
};