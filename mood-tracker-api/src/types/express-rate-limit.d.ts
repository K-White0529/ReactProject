/**
 * express-rate-limit の型定義拡張
 * 
 * Express Request インターフェースに rateLimit プロパティを追加
 */

import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    rateLimit?: {
      limit: number;
      current: number;
      remaining: number;
      resetTime: Date | undefined;
    };
  }
}
