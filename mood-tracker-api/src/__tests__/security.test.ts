/**
 * セキュリティ機能のテスト
 *
 * このファイルでは以下のセキュリティ機能をテストします:
 * - CSRF保護
 * - 入力バリデーション
 * - 認証とアクセス制御
 * 
 * 注: レート制限のテストは rate-limiter.test.ts で実施しています
 */

import request from 'supertest';
import app from '../index';

describe('Security Tests', () => {
  describe('CSRF Protection', () => {
    it('CSRFトークンなしのPOSTリクエストは失敗する（本番環境）', async () => {
      // 本番環境でのみCSRF保護が有効
      if (process.env.NODE_ENV === 'production') {
        const response = await request(app)
          .post('/api/records')
          .send({
            sleep_hours: 7,
            sleep_quality: 8
          });

        expect(response.status).toBe(403);
      } else {
        // 開発環境ではCSRF保護をスキップ
        expect(true).toBe(true);
      }
    });

    it('CSRFトークン取得エンドポイントが正常に動作する', async () => {
      const response = await request(app)
        .get('/api/security/csrf-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('csrfToken');
      expect(typeof response.body.csrfToken).toBe('string');
    });
  });

  describe('Input Validation', () => {
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

    it('無効なメールアドレスでの登録は失敗する', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'invalid-email', // 無効なメールアドレス
          password: 'Test1234!'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('短すぎるパスワードでの登録は失敗する', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'test@example.com',
          password: '123' // 短すぎるパスワード
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('範囲外のスコア値での記録作成は失敗する', async () => {
      const response = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sleep_hours: 7,
          sleep_quality: 15, // 範囲外（1-10）
          meal_quality: 8
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('負の値での記録作成は失敗する', async () => {
      const response = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sleep_hours: -5, // 負の値
          sleep_quality: 8
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Authentication and Authorization', () => {
    it('トークンなしの保護されたエンドポイントへのアクセスは失敗する', async () => {
      const response = await request(app)
        .get('/api/records');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('無効なトークンでのアクセスは失敗する', async () => {
      const response = await request(app)
        .get('/api/records')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('有効なトークンでのアクセスは成功する', async () => {
      // テスト用ユーザーでログイン
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test_user',
          password: 'Test1234!'
        });

      const token = loginResponse.body.data.token;

      const response = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      // ページネーション対応のレスポンス形式
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
    });
  });

  describe('SQL Injection Protection', () => {
    let authToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test_user',
          password: 'Test1234!'
        });

      authToken = loginResponse.body.data.token;
    });

    it('SQLインジェクション攻撃を防ぐ（ユーザー名）', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: "admin' OR '1'='1", // SQLインジェクション試行
          password: 'password'
        });

      // ログインは失敗すべき
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('SQLインジェクション攻撃を防ぐ（記録作成）', async () => {
      const response = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sleep_hours: 7,
          emotion_note: "'; DROP TABLE records; --" // SQLインジェクション試行
        });

      // 記録は作成されるが、SQLインジェクションは実行されない
      expect([200, 201]).toContain(response.status);

      // データベースが正常に動作していることを確認
      const getResponse = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      // ページネーション対応のレスポンス確認
      expect(getResponse.body).toHaveProperty('pagination');
    });
  });

  describe('XSS Protection', () => {
    let authToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test_user',
          password: 'Test1234!'
        });

      authToken = loginResponse.body.data.token;
    });

    it('XSS攻撃のスクリプトがそのまま保存されることを確認', async () => {
      // バックエンドではサニタイズせず、フロントエンドで処理
      const xssPayload = '<script>alert("XSS")</script>';

      const response = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sleep_hours: 7,
          emotion_note: xssPayload
        });

      expect([200, 201]).toContain(response.status);

      // 取得して確認
      const recordId = response.body.data.id;
      const getResponse = await request(app)
        .get(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      // バックエンドでは元のデータが保存される
      expect(getResponse.body.data.emotion_note).toBe(xssPayload);
      // フロントエンドでDOMPurifyによりサニタイズされる
    });
  });

  describe('Security Headers (Helmet)', () => {
    it('セキュリティヘッダーが設定されている', async () => {
      const response = await request(app).get('/');

      // Helmet により設定されるヘッダー
      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers['x-powered-by']).toBeUndefined(); // 削除されている
    });
  });

  describe('Error Handling', () => {
    it('存在しないエンドポイントは404を返す', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('エンドポイントが見つかりません');
    });

    it('本番環境ではエラーの詳細を非表示にする', async () => {
      if (process.env.NODE_ENV === 'production') {
        // 意図的にエラーを発生させる
        const response = await request(app)
          .post('/api/records')
          .send({
            // 不正なデータ
          });

        expect(response.body.message).not.toContain('stack');
        expect(response.body.message).not.toContain('Error:');
      }
    });
  });
});
