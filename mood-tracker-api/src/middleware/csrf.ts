import { RequestHandler } from 'express';

/**
 * テスト環境用のダミーCSRF保護ミドルウェア
 * 何もせずに次のミドルウェアに処理を渡す
 */
const dummyCsrfProtection: RequestHandler = (req, res, next) => {
  next();
};

/**
 * 本番環境用のCSRF保護ミドルウェア
 * csurfライブラリを使用
 */
const createRealCsrfProtection = (): RequestHandler => {
  const csrf = require('csurf');
  return csrf({ 
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1時間
    }
  });
};

/**
 * CSRF保護を条件付きで適用するミドルウェア
 * 
 * テスト環境・CI環境では何もしないダミーミドルウェアを使用
 * それ以外の環境では実際のCSRF保護を適用
 */
export const conditionalCsrfProtection: RequestHandler = (req, res, next) => {
  const nodeEnv = process.env.NODE_ENV;
  const disableCsrf = process.env.DISABLE_CSRF;
  const isCI = process.env.CI;
  
  // スキップ条件
  const shouldSkip = (
    nodeEnv === 'test' || 
    disableCsrf === 'true' || 
    isCI === 'true'
  );
  
  if (shouldSkip) {
    console.log('[CSRF] SKIPPED -', { nodeEnv, disableCsrf, isCI });
    return dummyCsrfProtection(req, res, next);
  }
  
  // 本番環境・開発環境では実際のCSRF保護を適用
  console.log('[CSRF] APPLIED');
  const realCsrf = createRealCsrfProtection();
  return realCsrf(req, res, next);
};

// 後方互換性のため（開発環境・本番環境用）
export const csrfProtection: RequestHandler = (req, res, next) => {
  const realCsrf = createRealCsrfProtection();
  return realCsrf(req, res, next);
};
