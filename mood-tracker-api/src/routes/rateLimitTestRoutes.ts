import { Router, Request, Response } from 'express';
import { testAuthLimiter, testApiLimiter, testAiLimiter, testReadLimiter } from '../middleware/rateLimiter';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * レート制限テスト用エンドポイント: 認証
 * 3回/1分の制限
 */
router.post('/test-auth', testAuthLimiter, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Auth limiter test endpoint',
    timestamp: new Date().toISOString()
  });
});

/**
 * レート制限テスト用エンドポイント: API
 * 5回/1分の制限
 */
router.post('/test-api', authenticateToken, testApiLimiter, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API limiter test endpoint',
    timestamp: new Date().toISOString()
  });
});

/**
 * レート制限テスト用エンドポイント: AI
 * 2回/1分の制限
 */
router.post('/test-ai', authenticateToken, testAiLimiter, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'AI limiter test endpoint',
    timestamp: new Date().toISOString()
  });
});

/**
 * レート制限テスト用エンドポイント: 読み取り
 * 10回/1分の制限
 */
router.get('/test-read', authenticateToken, testReadLimiter, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Read limiter test endpoint',
    timestamp: new Date().toISOString()
  });
});

export default router;
