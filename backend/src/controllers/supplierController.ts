import { Request, Response } from 'express';
import Supplier from '../models/Supplier';

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
      suppliers,
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

    res.json(supplier);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, location, responseTime } = req.body;

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
    const { name, phone, address, location, verified, rating, responseTime } = req.body;

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { name, phone, address, location, verified, rating, responseTime },
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
