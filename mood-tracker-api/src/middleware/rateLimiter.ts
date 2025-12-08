/// <reference path="../types/express.d.ts" />

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// 本番環境かどうかを判定
const isProduction = process.env.NODE_ENV === 'production';

// 本番環境以外（開発・テスト）ではレート制限を大幅に緩和
// これによりE2Eテストや開発時のテストが問題なく実行できます
const getMaxRequests = (productionMax: number) => {
  return isProduction ? productionMax : 10000;
};

/**
 * 一般的なAPIエンドポイント用のレート制限
 * 本番: 15分間に100リクエストまで
 * 開発・テスト: 15分間に10000リクエストまで（実質無制限）
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: getMaxRequests(100),
  standardHeaders: true,
  legacyHeaders: false,
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
 * 本番: 15分間に5リクエストまで（ブルートフォース攻撃対策）
 * 開発・テスト: 15分間に10000リクエストまで（実質無制限）
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: getMaxRequests(5),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req: Request, res: Response) => {
    const environment = process.env.NODE_ENV || 'development';
    console.warn(`[Rate Limit] Auth attempt blocked from IP: ${req.ip} (Environment: ${environment})`);
    
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
 * 本番: 1時間に10リクエストまで（APIコスト削減）
 * 開発・テスト: 1時間に10000リクエストまで（実質無制限）
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: getMaxRequests(10),
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
 * 本番: 15分間に200リクエストまで
 * 開発・テスト: 15分間に10000リクエストまで（実質無制限）
 */
export const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: getMaxRequests(200),
  message: 'リクエストが多すぎます。しばらく待ってから再度お試しください。',
  standardHeaders: true,
  legacyHeaders: false
});

// ===== レート制限テスト専用のリミッター =====

/**
 * レート制限テスト専用: 認証エンドポイント用
 * 短時間で制限に到達するように設定
 */
export const testAuthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分
  max: 3, // 最大3リクエスト
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: '認証の試行回数が多すぎます。1分後に再度お試しください。',
      retryAfter: 60
    });
  }
});

/**
 * レート制限テスト専用: API用
 * 短時間で制限に到達するように設定
 */
export const testApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分
  max: 5, // 最大5リクエスト
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'リクエストが多すぎます。しばらく待ってから再度お試しください。',
      retryAfter: 60
    });
  }
});

/**
 * レート制限テスト専用: AI用
 * 短時間で制限に到達するように設定
 */
export const testAiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分
  max: 2, // 最大2リクエスト
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'AI生成のリクエストが多すぎます。1分後に再度お試しください。',
      retryAfter: 60
    });
  }
});

/**
 * レート制限テスト専用: 読み取り用
 * 短時間で制限に到達するように設定
 */
export const testReadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分
  max: 10, // 最大10リクエスト
  message: 'リクエストが多すぎます。しばらく待ってから再度お試しください。',
  standardHeaders: true,
  legacyHeaders: false
});
