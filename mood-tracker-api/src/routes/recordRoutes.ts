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
import { recordValidation, validate } from '../middleware/validation';
import { conditionalCsrfProtection } from '../middleware/csrf';
import { apiLimiter, readLimiter } from '../middleware/rateLimiter';

const router = Router();

// すべてのルートで認証が必要
router.use(authenticateToken);

// GET /api/records/stats - 統計情報取得
router.get('/stats', readLimiter, getRecordStats);

// GET /api/records/chart - グラフデータ取得
router.get('/chart', readLimiter, getChartData);

// GET /api/records - 記録一覧取得
router.get('/', readLimiter, getRecords);

// GET /api/records/:id - 特定の記録取得
router.get('/:id', readLimiter, getRecordById);

// POST /api/records - 記録作成
router.post('/', apiLimiter, conditionalCsrfProtection, recordValidation, validate, createRecord);

// PUT /api/records/:id - 記録更新
router.put('/:id', apiLimiter, conditionalCsrfProtection, recordValidation, validate, updateRecord);

// DELETE /api/records/:id - 記録削除
router.delete('/:id', apiLimiter, conditionalCsrfProtection, deleteRecord);

export default router;