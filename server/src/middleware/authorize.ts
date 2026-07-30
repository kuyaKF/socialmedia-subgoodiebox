import { NextFunction, Request, Response } from 'express';
import { HttpError } from './errorHandler';
import { UserRole } from '../models/User';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new HttpError(403, 'Insufficient permissions');
    }
    next();
  };
}
