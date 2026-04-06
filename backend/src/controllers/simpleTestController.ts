import { Request, Response } from 'express';

export const simpleTest = async (req: Request, res: Response): Promise<void> => {
  res.json({
    status: 'success',
    message: 'Simple test endpoint working'
  });
};