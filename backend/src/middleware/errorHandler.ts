import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
  ) {
    super(message);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
  }

  if (err.code === 'P2002') {
    // Prisma unique constraint error
    return res.status(400).json({
      error: 'Record already exists',
      statusCode: 400,
    });
  }

  if (err.code === 'P2025') {
    // Prisma record not found
    return res.status(404).json({
      error: 'Record not found',
      statusCode: 404,
    });
  }

  return res.status(500).json({
    error: 'Internal server error',
    statusCode: 500,
  });
};
