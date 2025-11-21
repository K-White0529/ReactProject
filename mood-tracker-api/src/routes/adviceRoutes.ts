import { Router } from "express";
import { getSimpleAdvice } from "../controllers/adviceController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// すべてのルートで認証が必要
router.use(authenticateToken);

// GET /api/advice/simple - シンプルなアドバイス取得（テスト用）
router.get("/simple", getSimpleAdvice);

export default router;
