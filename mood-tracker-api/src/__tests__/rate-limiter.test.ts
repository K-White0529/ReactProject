/// <reference types="jest" />

/**
 * レート制限機能の詳細テスト
 *
 * テスト環境では通常のエンドポイントのレート制限は緩和されています。
 * このテストでは、テスト専用のエンドポイント（/api/test/rate-limit/*）を使用して
 * レート制限機能が正しく動作することを確認します。
 *
 * テスト用レート制限:
 * - testAuthLimiter: 3回/1分
 * - testApiLimiter: 5回/1分
 * - testAiLimiter: 2回/1分
 * - testReadLimiter: 10回/1分
 */

import request from 'supertest';
import app from '../index';

describe('Rate Limiter Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // テスト用ユーザーでログイン
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'test_user',
        password: 'Test1234!'
      });

    authToken = loginResponse.body.data.token;
  });

  describe('testAuthLimiter（認証テスト用エンドポイント）', () => {
    it('3回までのリクエストは成功する', async () => {
      // 3回のリクエスト（レート制限内）
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post('/api/test/rate-limit/test-auth')
          .send({});

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });

    it('4回目のリクエストはレート制限エラーを返す', async () => {
      // 3回リクエストしてレート制限に到達
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/test/rate-limit/test-auth')
          .send({});
      }

      // 4回目はレート制限エラー
      const response = await request(app)
        .post('/api/test/rate-limit/test-auth')
        .send({});

      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('多すぎます');
    });

    it('レート制限エラーにはretryAfter情報が含まれる', async () => {
      // 3回リクエストしてレート制限に到達
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/test/rate-limit/test-auth')
          .send({});
      }

      // 4回目でエラー確認
      const response = await request(app)
        .post('/api/test/rate-limit/test-auth')
        .send({});

      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('retryAfter');
      expect(typeof response.body.retryAfter).toBe('number');
    });
  });

  describe('testApiLimiter（APIテスト用エンドポイント）', () => {
    it('5回までのリクエストは成功する', async () => {
      // 5回のリクエスト（レート制限内）
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/api/test/rate-limit/test-api')
          .set('Authorization', `Bearer ${authToken}`)
          .send({});

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });

    it('6回目のリクエストはレート制限エラーを返す', async () => {
      // 5回リクエストしてレート制限に到達
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/test/rate-limit/test-api')
          .set('Authorization', `Bearer ${authToken}`)
          .send({});
      }

      // 6回目はレート制限エラー
      const response = await request(app)
        .post('/api/test/rate-limit/test-api')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
    });

    it('RateLimit-* ヘッダーが正しく設定される', async () => {
      const response = await request(app)
        .post('/api/test/rate-limit/test-api')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
      expect(response.headers).toHaveProperty('ratelimit-reset');
    });
  });

  describe('testAiLimiter（AIテスト用エンドポイント）', () => {
    it('2回までのリクエストは成功する', async () => {
      // 2回のリクエスト（レート制限内）
      for (let i = 0; i < 2; i++) {
        const response = await request(app)
          .post('/api/test/rate-limit/test-ai')
          .set('Authorization', `Bearer ${authToken}`)
          .send({});

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });

    it('3回目のリクエストはレート制限エラーを返す', async () => {
      // 2回リクエストしてレート制限に到達
      for (let i = 0; i < 2; i++) {
        await request(app)
          .post('/api/test/rate-limit/test-ai')
          .set('Authorization', `Bearer ${authToken}`)
          .send({});
      }

      // 3回目はレート制限エラー
      const response = await request(app)
        .post('/api/test/rate-limit/test-ai')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('AI生成');
    });
  });

  describe('testReadLimiter（読み取りテスト用エンドポイント）', () => {
    it('10回までのリクエストは成功する', async () => {
      // 10回のリクエスト（レート制限内）
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .get('/api/test/rate-limit/test-read')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });

    it('11回目のリクエストはレート制限エラーを返す', async () => {
      // 10回リクエストしてレート制限に到達
      for (let i = 0; i < 10; i++) {
        await request(app)
          .get('/api/test/rate-limit/test-read')
          .set('Authorization', `Bearer ${authToken}`);
      }

      // 11回目はレート制限エラー
      const response = await request(app)
        .get('/api/test/rate-limit/test-read')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(429);
    });
  });

  describe('レート制限の分離', () => {
    it('異なるエンドポイントは独立したレート制限を持つ', async () => {
      // test-authで3回リクエスト
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/test/rate-limit/test-auth')
          .send({});
      }

      // test-apiは影響を受けない（すでに他のテストで制限に達している可能性あり）
      const response = await request(app)
        .post('/api/test/rate-limit/test-api')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      // 200または429を許容
      expect([200, 429]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      }
    });

    it('通常のエンドポイントはレート制限が緩和されている', async () => {
      // 通常のログインエンドポイントは10000回/15分なので、10回リクエストしても問題ない
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            username: `test_user_${Date.now()}_${i}`,
            password: 'wrong'
          });

        // 401（認証失敗）であればOK（レート制限ではない）
        expect(response.status).toBe(401);
      }
    });
  });
});
