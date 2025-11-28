import cors from 'cors';
import { Express } from 'express';

/**
 * CORS設定を環境に応じて適用する
 */
export function configureCORS(app: Express): void {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // 本番環境: 特定のオリジンのみ許可
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : [];

    app.use(
      cors({
        origin: (origin, callback) => {
          // オリジンが許可リストに含まれているか確認
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            console.warn(`CORS blocked: ${origin}`);
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true, // クッキーを含むリクエストを許可
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    console.log('✅ CORS configured for production');
    console.log('Allowed origins:', allowedOrigins);
  } else {
    // 開発環境: すべてのオリジンを許可
    app.use(
      cors({
        origin: true,
        credentials: true,
      })
    );

    console.log('✅ CORS configured for development (all origins allowed)');
  }
}
