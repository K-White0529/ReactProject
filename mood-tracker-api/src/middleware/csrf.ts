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
// 開発環境ではCSRF保護をスキップ（テストを容易にするため）
export const conditionalCsrfProtection: RequestHandler = (req, res, next) => {
  if (process.env.NODE_ENV === 'test' || process.env.DISABLE_CSRF === 'true') {
    return next();
  }
  return csrfProtection(req, res, next);
};
