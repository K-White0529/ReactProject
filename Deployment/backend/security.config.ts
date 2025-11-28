import { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * セキュリティヘッダーを設定する
 */
export function configureSecurity(app: Express): void {
  // Helmet を使用してセキュリティヘッダーを設定
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000, // 1年間
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // カスタムセキュリティヘッダー
  app.use((req: Request, res: Response, next: NextFunction) => {
    // X-Content-Type-Options
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // X-Frame-Options
    res.setHeader('X-Frame-Options', 'DENY');

    // X-XSS-Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer-Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    next();
  });

  console.log('✅ Security headers configured');
}

/**
 * レート制限を設定する
 */
export function configureRateLimiting(app: Express): void {
  const rateLimit = require('express-rate-limit');

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分
    max: 100, // 最大100リクエスト
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // すべてのエンドポイントにレート制限を適用
  app.use('/api/', limiter);

  // 認証エンドポイントには厳格なレート制限
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 15分間に最大5回
    message: 'Too many login attempts, please try again later.',
  });

  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  console.log('✅ Rate limiting configured');
}
