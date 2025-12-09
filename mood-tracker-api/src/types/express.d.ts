import 'express';

// グローバルな型定義の拡張
declare global {
  namespace Express {
    interface Request {
      // express-rate-limitが追加するプロパティ
      rateLimit?: {
        limit: number;
        current: number;
        remaining: number;
        resetTime?: Date;
      };
      
      // JWT認証が追加するプロパティ
      user?: {
        userId: number;
        username: string;
      };
    }
  }
}

// このファイルをモジュールとして扱う
export {};
