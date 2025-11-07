import { Router } from 'express';
import { getCurrentWeatherData } from '../controllers/weatherController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 認証が必要
router.use(authenticateToken);

// GET /api/weather/current - 現在の気象データ取得
router.get('/current', getCurrentWeatherData);

export default router;