import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

// Requestに認証情報を追加するための型拡張
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * JWT認証ミドルウェア
 */
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Authorizationヘッダーからトークンを取得
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    res.status(401).json({
      success: false,
      message: '認証トークンが必要です'
    });
    return;
  }

  try {
    // トークンを検証
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // リクエストにユーザー情報を追加
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: '無効なトークンです'
    });
  }
}