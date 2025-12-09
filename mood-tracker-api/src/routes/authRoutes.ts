import { Router } from 'express';
import { register, login, getCurrentUser, deleteUser, cleanupTestUsers } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { registerValidation, loginValidation, validate } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/auth/register - ユーザー登録
router.post('/register', authLimiter, registerValidation, validate, register);

// POST /api/auth/login - ログイン
router.post('/login', authLimiter, loginValidation, validate, login);

// GET /api/auth/me - 現在のユーザー情報取得（認証必要）
router.get('/me', authenticateToken, getCurrentUser);

// DELETE /api/auth/test-user/:username - テストユーザー削除（開発環境のみ）
router.delete('/test-user/:username', deleteUser);

// DELETE /api/auth/test-users/cleanup - テストユーザー一括削除（開発環境のみ）
router.delete('/test-users/cleanup', cleanupTestUsers);

export default router;