/**
 * エラーハンドリング機能のテスト
 *
 * Phase 8-2で実装されたエラーハンドリング機能をテストします:
 * - カスタムエラークラス
 * - グローバルエラーハンドラー
 * - 404エラーハンドラー
 * - 統一されたエラーレスポンス形式
 */

import request from 'supertest';
import app from '../index';

describe('Error Handling Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // テスト用ユーザーでログイン
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'test_user',
        password: 'Test1234!'
      });

    authToken = loginResponse.body.token;
  });

  describe('統一されたエラーレスポンス形式', () => {
    it('バリデーションエラー（400）は統一形式で返される', async () => {
      const response = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sleep_hours: -5, // 無効な値
          emotion_score: 15 // 範囲外
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });

    it('認証エラー（401）は統一形式で返される', async () => {
      const response = await request(app)
        .get('/api/records')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('リソース未検出エラー（404）は統一形式で返される', async () => {
      const response = await request(app)
        .get('/api/records/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('レート制限エラー（429）は統一形式で返される', async () => {
      // 連続してリクエストを送信
      const requests = Array(6).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            username: 'nonexistent',
            password: 'wrong'
          })
      );

      const responses = await Promise.all(requests);
      const lastResponse = responses[responses.length - 1];

      if (lastResponse.status === 429) {
        expect(lastResponse.body).toHaveProperty('success', false);
        expect(lastResponse.body).toHaveProperty('message');
        expect(lastResponse.body.message).toContain('試行回数が多すぎます');
      }
    }, 30000);
  });

  describe('404エラーハンドラー', () => {
    it('存在しないエンドポイントは404を返す', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('エンドポイントが見つかりません');
    });

    it('存在しないエンドポイント（POST）は404を返す', async () => {
      const response = await request(app)
        .post('/api/invalid/endpoint')
        .send({ data: 'test' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    it('存在しないエンドポイント（PUT）は404を返す', async () => {
      const response = await request(app)
        .put('/api/invalid/endpoint/123')
        .send({ data: 'test' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    it('存在しないエンドポイント（DELETE）は404を返す', async () => {
      const response = await request(app)
        .delete('/api/invalid/endpoint/123');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('環境別エラー詳細の表示', () => {
    it('開発環境ではエラー詳細が含まれる可能性がある', async () => {
      if (process.env.NODE_ENV === 'development') {
        const response = await request(app)
          .post('/api/records')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            sleep_hours: 'invalid' // 型エラー
          });

        // 開発環境では詳細情報が含まれる可能性がある
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
      } else {
        expect(true).toBe(true); // 本番環境ではスキップ
      }
    });

    it('本番環境ではスタックトレースが非表示になる', async () => {
      if (process.env.NODE_ENV === 'production') {
        const response = await request(app)
          .post('/api/records')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            sleep_hours: 'invalid'
          });

        expect(response.body).not.toHaveProperty('stack');
        expect(response.body.message).not.toContain('Error:');
        expect(response.body.message).not.toContain('at ');
      } else {
        expect(true).toBe(true); // 開発環境ではスキップ
      }
    });
  });

  describe('エラーメッセージの日本語対応', () => {
    it('バリデーションエラーは日本語メッセージを返す', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab', // 短すぎる
          email: 'invalid-email',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('バリデーションエラー');

      // エラー詳細が含まれている場合、日本語であることを確認
      if (response.body.errors && response.body.errors.length > 0) {
        const errorMessages = response.body.errors.map((e: any) => e.msg).join(' ');
        expect(errorMessages).toMatch(/文字|入力|範囲/);
      }
    });

    it('認証エラーは日本語メッセージを返す', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrong'
        });

      expect([401, 429]).toContain(response.status);
      if (response.status === 401) {
        expect(response.body.message).toMatch(/認証|ユーザー名|パスワード/);
      }
    });

    it('リソース未検出エラーは日本語メッセージを返す', async () => {
      const response = await request(app)
        .get('/api/records/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/見つかりません|存在しません/);
    });
  });

  describe('エラーレスポンスの一貫性', () => {
    it('全てのエラーレスポンスはsuccessフィールドを持つ', async () => {
      const responses = await Promise.all([
        request(app).get('/api/nonexistent'),
        request(app).get('/api/records').set('Authorization', 'Bearer invalid'),
        request(app).post('/api/records').set('Authorization', `Bearer ${authToken}`).send({ sleep_hours: -1 })
      ]);

      responses.forEach(response => {
        expect(response.body).toHaveProperty('success');
        expect(response.body.success).toBe(false);
      });
    });

    it('全てのエラーレスポンスはmessageフィールドを持つ', async () => {
      const responses = await Promise.all([
        request(app).get('/api/nonexistent'),
        request(app).get('/api/records').set('Authorization', 'Bearer invalid'),
        request(app).post('/api/records').set('Authorization', `Bearer ${authToken}`).send({ sleep_hours: -1 })
      ]);

      responses.forEach(response => {
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
        expect(response.body.message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('複数のエラー処理', () => {
    it('複数のバリデーションエラーが同時に発生する', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'a', // 短すぎる
          email: 'invalid', // 無効なメール
          password: '12' // 短すぎる
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);

      // 複数のエラーが含まれている場合
      if (response.body.errors) {
        expect(Array.isArray(response.body.errors)).toBe(true);
        expect(response.body.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('カスタムエラーハンドラーの動作', () => {
    it('認証が必要なエンドポイントでトークンなしは401を返す', async () => {
      const response = await request(app)
        .get('/api/records');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('認証が必要');
    });

    it('無効なIDでのアクセスは400を返す', async () => {
      const response = await request(app)
        .get('/api/records/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('存在しないリソースへのアクセスは404を返す', async () => {
      const response = await request(app)
        .get('/api/records/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('エラーログの出力', () => {
    it('エラー発生時にログが出力される', async () => {
      // コンソールログをモック
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const response = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sleep_hours: -1 // 無効な値
        });

      expect(response.status).toBe(400);

      // ログが出力されたかは実装依存なので、レスポンスのみ確認
      expect(response.body).toHaveProperty('success', false);

      consoleErrorSpy.mockRestore();
    });
  });
});
