import csrf from 'csurf';
import { RequestHandler } from 'express';

// CSRF保護ミドルウェア（Cookie使用）
export const csrfProtection: RequestHandler = csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000, // 1時間
  }
});

// CSRF保護（条件付き）
// テスト環境・開発環境ではCSRF保護をスキップ
export const conditionalCsrfProtection: RequestHandler = (req, res, next) => {
  const nodeEnv = process.env.NODE_ENV;
  const disableCsrf = process.env.DISABLE_CSRF;
  
  // デバッグログ
  if (nodeEnv === 'test') {
    console.log('[CSRF] NODE_ENV:', nodeEnv);
    console.log('[CSRF] DISABLE_CSRF:', disableCsrf);
    console.log('[CSRF] Skipping CSRF protection');
  }
  
  // テスト環境または明示的に無効化されている場合はスキップ
  if (nodeEnv === 'test' || disableCsrf === 'true') {
    return next();
  }
  
  // 本番環境・開発環境ではCSRF保護を適用
  return csrfProtection(req, res, next);
};
