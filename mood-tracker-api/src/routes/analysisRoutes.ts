import { Router } from 'express';
import { getCategories, getQuestions, saveAnswers } from '../controllers/analysisController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// すべてのルートで認証が必要
router.use(authenticateToken);

// GET /api/analysis/categories - 分析観点一覧取得
router.get('/categories', getCategories);

// GET /api/analysis/questions - 質問一覧取得
router.get('/questions', getQuestions);

// POST /api/analysis/answers - 回答保存
router.post('/answers', saveAnswers);

export default router;