import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * 一般的なAPIエンドポイント用のレート制限
 * 15分間に100リクエストまで
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 最大100リクエスト
  message: {
    success: false,
    message: 'リクエストが多すぎます。しばらく待ってから再度お試しください。',
    retryAfter: '15分後'
  },
  standardHeaders: true, // RateLimit-* ヘッダーを返す
  legacyHeaders: false, // X-RateLimit-* ヘッダーを返さない
  handler: (req: Request, res: Response) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime ? Math.ceil((resetTime.getTime() - Date.now()) / 1000) : 900;
    
    res.status(429).json({
      success: false,
      message: 'リクエストが多すぎます。しばらく待ってから再度お試しください。',
      retryAfter
    });
  }
});

/**
 * 認証エンドポイント用の厳格なレート制限
 * 15分間に5リクエストまで（ブルートフォース攻撃対策）
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 5, // 最大5リクエスト
  message: {
    success: false,
    message: '認証の試行回数が多すぎます。15分後に再度お試しください。',
    retryAfter: '15分後'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // 成功したリクエストもカウント
  handler: (req: Request, res: Response) => {
    console.warn(`[Rate Limit] Auth attempt blocked from IP: ${req.ip}`);
    
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime ? Math.ceil((resetTime.getTime() - Date.now()) / 1000) : 900;
    
    res.status(429).json({
      success: false,
      message: '認証の試行回数が多すぎます。15分後に再度お試しください。',
      retryAfter
    });
  }
});

/**
 * AI生成エンドポイント用のレート制限
 * 1時間に10リクエストまで（APIコスト削減）
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 10, // 最大10リクエスト
  message: {
    success: false,
    message: 'AI生成のリクエストが多すぎます。1時間後に再度お試しください。',
    retryAfter: '1時間後'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`[Rate Limit] AI generation blocked from IP: ${req.ip}`);
    
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime ? Math.ceil((resetTime.getTime() - Date.now()) / 1000) : 3600;
    
    res.status(429).json({
      success: false,
      message: 'AI生成のリクエストが多すぎます。1時間後に再度お試しください。',
      retryAfter
    });
  }
});

/**
 * データ取得エンドポイント用の緩いレート制限
 * 15分間に200リクエストまで
 */
export const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 200, // 最大200リクエスト
  message: {
    success: false,
    message: 'リクエストが多すぎます。しばらく待ってから再度お試しください。'
  },
  standardHeaders: true,
  legacyHeaders: false
});
