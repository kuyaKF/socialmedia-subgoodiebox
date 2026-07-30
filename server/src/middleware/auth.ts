import { NextFunction, Request, Response } from 'express';
import { HttpError } from './errorHandler';
import { verifyAccessToken } from '../utils/jwt';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.token;
  if (!token) {
    throw new HttpError(401, 'Not authenticated');
  }
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    throw new HttpError(401, 'Invalid or expired session');
  }
}

// For genuinely public routes that personalize their response when a valid session happens to
// be present (e.g. the public blog's "did I like this" flag) — never rejects the request.
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.token;
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, role: payload.role };
    } catch {
      // invalid/expired token — proceed as a guest rather than failing the request
    }
  }
  next();
}
