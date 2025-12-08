import { Router } from 'express';
import { getCurrentWeatherData, getWeatherByRecordId } from '../controllers/weatherController';
import { authenticateToken } from '../middleware/auth';
import { readLimiter } from '../middleware/rateLimiter';

const router = Router();

// 認証が必要
router.use(authenticateToken);

// GET /api/weather/current - 現在の気象データ取得
router.get('/current', readLimiter, getCurrentWeatherData);

// GET /api/weather/record/:recordId - 記録に紐づく気象データ取得
router.get('/record/:recordId', readLimiter, getWeatherByRecordId);

export default router;