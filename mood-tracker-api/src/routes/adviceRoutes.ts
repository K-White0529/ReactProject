import { Router } from "express";
import { getSimpleAdvice, getPersonalizedAdvice, getAdviceHistory } from "../controllers/adviceController";
import { authenticateToken } from "../middleware/auth";
import { aiLimiter, readLimiter } from "../middleware/rateLimiter";
import { daysQueryValidation, limitQueryValidation, validate } from "../middleware/validation";

const router = Router();

// すべてのルートで認証が必要
router.use(authenticateToken);

// GET /api/advice/simple - シンプルなアドバイス取得（テスト用）
router.get("/simple", aiLimiter, getSimpleAdvice);

// GET /api/advice/personalized - パーソナライズドアドバイス生成
router.get("/personalized", aiLimiter, daysQueryValidation, validate, getPersonalizedAdvice);

// GET /api/advice/history - アドバイス履歴取得
router.get("/history", readLimiter, limitQueryValidation, validate, getAdviceHistory);

export default router;
