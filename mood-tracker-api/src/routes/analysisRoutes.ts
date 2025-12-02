import { Router } from 'express';
import { getCategories, getQuestions, saveAnswers, generateQuestions, getCategoryScores, getCategoryTrends, getRandomQuestions, analyzeUserData } from '../controllers/analysisController';
import { authenticateToken } from '../middleware/auth';
import { conditionalCsrfProtection } from '../middleware/csrf';

const router = Router();

// すべてのルートで認証が必要
router.use(authenticateToken);

// GET /api/analysis/categories - 分析観点一覧取得
router.get('/categories', getCategories);

// GET /api/analysis/questions - 質問一覧取得
router.get('/questions', getQuestions);

// POST /api/analysis/answers - 回答保存
router.post('/answers', conditionalCsrfProtection, saveAnswers);

// POST /api/analysis/generate - AI質問生成（テスト用）
router.post('/generate', conditionalCsrfProtection, generateQuestions);

// GET /api/analysis/scores - 観点別平均スコア取得
router.get('/scores', getCategoryScores);

// GET /api/analysis/trends - 観点別スコア遷移取得
router.get('/trends', getCategoryTrends);

// GET /api/analysis/random - ランダムな質問取得（記録入力用）
router.get('/random', getRandomQuestions);

// GET /api/analysis/analyze - ユーザーデータのAI分析
router.get('/analyze', analyzeUserData);

export default router;