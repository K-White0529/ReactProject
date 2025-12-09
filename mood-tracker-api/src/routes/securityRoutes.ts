import { Router, Request, Response } from 'express';
import { csrfProtection } from '../middleware/csrf';

const router = Router();

/**
 * CSRFトークンを取得
 * GET /api/security/csrf-token
 */
router.get('/csrf-token', csrfProtection, (req: Request, res: Response) => {
  res.json({
    success: true,
    csrfToken: (req as any).csrfToken()
  });
});

export default router;
