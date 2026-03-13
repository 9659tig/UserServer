import { Request, Response, NextFunction } from 'express';
import { SEARCH_CONFIG } from '../config/secret';

export function internalAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers['x-internal-token'] as string;
  if (!SEARCH_CONFIG.INTERNAL_SYNC_TOKEN || token !== SEARCH_CONFIG.INTERNAL_SYNC_TOKEN) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  next();
}
