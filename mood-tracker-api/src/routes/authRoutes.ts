import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { registerValidation, loginValidation, validate } from '../middleware/validation';

const router = Router();

// POST /api/auth/register - ユーザー登録
router.post('/register', registerValidation, validate, register);

// POST /api/auth/login - ログイン
router.post('/login', loginValidation, validate, login);

// GET /api/auth/me - 現在のユーザー情報取得（認証必要）
router.get('/me', authenticateToken, getCurrentUser);

export default router;