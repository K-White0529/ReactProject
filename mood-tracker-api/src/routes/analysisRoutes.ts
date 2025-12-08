import { Router } from 'express';
import { getCategories, getQuestions, saveAnswers, generateQuestions, getCategoryScores, getCategoryTrends, getRandomQuestions, analyzeUserData } from '../controllers/analysisController';
import { authenticateToken } from '../middleware/auth';
import { conditionalCsrfProtection } from '../middleware/csrf';
import { aiLimiter, apiLimiter, readLimiter } from '../middleware/rateLimiter';
import { answersValidation, generateQuestionsValidation, daysQueryValidation, periodQueryValidation, validate } from '../middleware/validation';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();

// すべてのルートで認証が必要
router.use(authenticateToken);

// GET /api/analysis/categories - 分析観点一覧取得
router.get('/categories', readLimiter, cacheMiddleware(600), getCategories);

// GET /api/analysis/questions - 質問一覧取得
router.get('/questions', readLimiter, cacheMiddleware(600), getQuestions);

// POST /api/analysis/answers - 回答保存
router.post('/answers', apiLimiter, conditionalCsrfProtection, answersValidation, validate, saveAnswers);

// POST /api/analysis/generate - AI質問生成（テスト用）
router.post('/generate', aiLimiter, conditionalCsrfProtection, generateQuestionsValidation, validate, generateQuestions);

// GET /api/analysis/scores - 観点別平均スコア取得
router.get('/scores', readLimiter, cacheMiddleware(300), daysQueryValidation, validate, getCategoryScores);

// GET /api/analysis/trends - 観点別スコア遷移取得
router.get('/trends', readLimiter, cacheMiddleware(300), periodQueryValidation, validate, getCategoryTrends);

// GET /api/analysis/random - ランダムな質問取得（記録入力用）
router.get('/random', readLimiter, cacheMiddleware(60), getRandomQuestions);

// GET /api/analysis/analyze - ユーザーデータのAI分析
router.get('/analyze', aiLimiter, daysQueryValidation, validate, analyzeUserData);

export default router;