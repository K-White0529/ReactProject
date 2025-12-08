/**
 * キャッシュミドルウェア
 * 
 * node-cacheを使用したシンプルなメモリキャッシュ実装
 */

import NodeCache from 'node-cache';
import { Request, Response, NextFunction } from 'express';

/**
 * キャッシュインスタンス
 * 
 * stdTTL: デフォルトTTL（秒）
 * checkperiod: 期限切れチェック間隔（秒）
 * useClones: クローンを使用（データ整合性のため）
 */
const cache = new NodeCache({
  stdTTL: 300, // 5分
  checkperiod: 60, // 1分ごとにチェック
  useClones: false // パフォーマンス優先
});

/**
 * キャッシュキー生成
 */
function generateCacheKey(req: Request): string {
  const userId = req.user?.userId || 'anonymous';
  const path = req.originalUrl;
  return `${userId}:${path}`;
}

/**
 * キャッシュミドルウェア
 * 
 * GETリクエストのレスポンスをキャッシュする
 */
export function cacheMiddleware(ttl: number = 300) {
  return (req: Request, res: Response, next: NextFunction) => {
    // GETリクエストのみキャッシュ
    if (req.method !== 'GET') {
      return next();
    }

    const key = generateCacheKey(req);
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      console.log(`[Cache] Hit: ${key}`);
      res.json(cachedResponse);
      return;
    }

    // オリジナルのres.jsonを保存
    const originalJson = res.json.bind(res);

    // res.jsonをオーバーライド
    res.json = function(body: any) {
      // キャッシュに保存
      cache.set(key, body, ttl);
      console.log(`[Cache] Set: ${key} (TTL: ${ttl}s)`);
      
      // オリジナルのres.jsonを呼び出し
      return originalJson(body);
    };

    next();
  };
}

/**
 * 特定のパターンのキャッシュをクリア
 */
export function clearCache(pattern?: string): void {
  if (pattern) {
    const keys = cache.keys().filter(key => key.includes(pattern));
    keys.forEach(key => cache.del(key));
    console.log(`[Cache] Cleared ${keys.length} keys matching: ${pattern}`);
  } else {
    cache.flushAll();
    console.log('[Cache] Cleared all keys');
  }
}

/**
 * ユーザーのキャッシュをクリア
 */
export function clearUserCache(userId: number): void {
  clearCache(`${userId}:`);
}

/**
 * キャッシュ統計情報取得
 */
export function getCacheStats() {
  return cache.getStats();
}

export { cache };
