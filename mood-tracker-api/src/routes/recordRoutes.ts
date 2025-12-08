import { Router } from 'express';
import {
  getRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  getRecordStats,
  getChartData
} from '../controllers/recordController';
import { authenticateToken } from '../middleware/auth';
import { recordValidation, idParamValidation, limitQueryValidation, validate } from '../middleware/validation';
import { conditionalCsrfProtection } from '../middleware/csrf';
import { apiLimiter, readLimiter } from '../middleware/rateLimiter';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();

// すべてのルートで認証が必要
router.use(authenticateToken);

// GET /api/records/stats - 統計情報取得
router.get('/stats', readLimiter, cacheMiddleware(300), getRecordStats);

// GET /api/records/chart - グラフデータ取得
router.get('/chart', readLimiter, cacheMiddleware(300), getChartData);

// GET /api/records - 記録一覧取得
router.get('/', readLimiter, cacheMiddleware(60), limitQueryValidation, validate, getRecords);

// GET /api/records/:id - 特定の記録取得
router.get('/:id', readLimiter, cacheMiddleware(300), idParamValidation, validate, getRecordById);

// POST /api/records - 記録作成
router.post('/', apiLimiter, conditionalCsrfProtection, recordValidation, validate, createRecord);

// PUT /api/records/:id - 記録更新
router.put('/:id', apiLimiter, conditionalCsrfProtection, idParamValidation, recordValidation, validate, updateRecord);

// DELETE /api/records/:id - 記録削除
router.delete('/:id', apiLimiter, conditionalCsrfProtection, idParamValidation, validate, deleteRecord);

export default router;