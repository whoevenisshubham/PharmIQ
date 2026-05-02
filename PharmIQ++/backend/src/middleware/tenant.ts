import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

export const tenantMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.tenantId) {
    return res.status(401).json({ error: 'Tenant ID not found' });
  }
  next();
};
