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

const router = Router();

// すべてのルートで認証が必要
router.use(authenticateToken);

// GET /api/records/stats - 統計情報取得
router.get('/stats', getRecordStats);

// GET /api/records/chart - グラフデータ取得
router.get('/chart', getChartData);

// GET /api/records - 記録一覧取得
router.get('/', getRecords);

// GET /api/records/:id - 特定の記録取得
router.get('/:id', getRecordById);

// POST /api/records - 記録作成
router.post('/', conditionalCsrfProtection, recordValidation, validate, createRecord);

// PUT /api/records/:id - 記録更新
router.put('/:id', conditionalCsrfProtection, recordValidation, validate, updateRecord);

// DELETE /api/records/:id - 記録削除
router.delete('/:id', conditionalCsrfProtection, deleteRecord);

export default router;