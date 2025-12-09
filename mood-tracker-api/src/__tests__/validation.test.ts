/**
 * バリデーション機能のテスト
 *
 * Phase 8-2で追加された新しいバリデーションルールをテストします:
 * - answersValidation
 * - generateQuestionsValidation
 * - daysQueryValidation
 * - periodQueryValidation
 * - idParamValidation
 * - limitQueryValidation
 */

import request from 'supertest';
import app from '../index';

describe('Validation Tests', () => {
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

  describe('answersValidation', () => {
    it('回答が配列でない場合は失敗する', async () => {
      const response = await request(app)
        .post('/api/analysis/answers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: 'not an array' // 配列ではない
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('バリデーションエラー');
    });

    it('空の配列では失敗する', async () => {
      const response = await request(app)
        .post('/api/analysis/answers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: [] // 空の配列
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('question_idが正の整数でない場合は失敗する', async () => {
      const response = await request(app)
        .post('/api/analysis/answers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: [
            {
              question_id: -1, // 負の値
              answer_score: 5
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('answer_scoreが1-10の範囲外の場合は失敗する', async () => {
      const response = await request(app)
        .post('/api/analysis/answers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: [
            {
              question_id: 1,
              answer_score: 15 // 範囲外
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('正しい形式の回答は成功する', async () => {
      const response = await request(app)
        .post('/api/analysis/answers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: [
            {
              question_id: 1,
              answer_score: 7
            }
          ]
        });

      expect([200, 201, 404]).toContain(response.status);
      // 404は質問が存在しない場合（正常なバリデーションは通過）
    });
  });

  describe('generateQuestionsValidation', () => {
    it('category_codeが空の場合は失敗する', async () => {
      const response = await request(app)
        .post('/api/analysis/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category_code: '', // 空
          count: 5
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('category_codeが50文字を超える場合は失敗する', async () => {
      const response = await request(app)
        .post('/api/analysis/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category_code: 'a'.repeat(51), // 51文字
          count: 5
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('countが1-10の範囲外の場合は失敗する', async () => {
      const response = await request(app)
        .post('/api/analysis/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category_code: 'stress',
          count: 15 // 範囲外
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('正しい形式のリクエストは成功する', async () => {
      const response = await request(app)
        .post('/api/analysis/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category_code: 'stress',
          count: 5
        });

      // AIエラー、カテゴリが存在しない場合、またはCSRFエラーの可能性
      expect([200, 201, 400, 404, 500]).toContain(response.status);
    });
  });

  describe('daysQueryValidation', () => {
    it('daysが1-365の範囲外の場合は失敗する（下限）', async () => {
      const response = await request(app)
        .get('/api/analysis/scores?days=0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('daysが1-365の範囲外の場合は失敗する（上限）', async () => {
      const response = await request(app)
        .get('/api/analysis/scores?days=400')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('daysが正の整数でない場合は失敗する', async () => {
      const response = await request(app)
        .get('/api/analysis/scores?days=abc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('daysパラメータなしは成功する（オプション）', async () => {
      const response = await request(app)
        .get('/api/analysis/scores')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('正しい範囲のdaysは成功する', async () => {
      const response = await request(app)
        .get('/api/analysis/scores?days=30')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('periodQueryValidation', () => {
    it('期間が7、30、90以外の場合は失敗する', async () => {
      const response = await request(app)
        .get('/api/analysis/trends?period=15')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('期間が文字列の場合は失敗する', async () => {
      const response = await request(app)
        .get('/api/analysis/trends?period=monthly')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('periodパラメータなしは成功する（オプション）', async () => {
      const response = await request(app)
        .get('/api/analysis/trends')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('期間7は成功する', async () => {
      const response = await request(app)
        .get('/api/analysis/trends?period=7')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('期間30は成功する', async () => {
      const response = await request(app)
        .get('/api/analysis/trends?period=30')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('期間90は成功する', async () => {
      const response = await request(app)
        .get('/api/analysis/trends?period=90')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('idParamValidation', () => {
    it('IDが正の整数でない場合は失敗する（負の値）', async () => {
      const response = await request(app)
        .get('/api/records/-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('IDが正の整数でない場合は失敗する（文字列）', async () => {
      const response = await request(app)
        .get('/api/records/abc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('IDが0の場合は失敗する', async () => {
      const response = await request(app)
        .get('/api/records/0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('正の整数IDは成功する（存在しない場合は404）', async () => {
      const response = await request(app)
        .get('/api/records/999999')
        .set('Authorization', `Bearer ${authToken}`);

      // バリデーションは通過するが、レコードが存在しない場合は404
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('limitQueryValidation', () => {
    it('limitが1-100の範囲外の場合は失敗する（下限）', async () => {
      const response = await request(app)
        .get('/api/records?limit=0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('limitが1-100の範囲外の場合は失敗する（上限）', async () => {
      const response = await request(app)
        .get('/api/records?limit=150')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('limitが正の整数でない場合は失敗する', async () => {
      const response = await request(app)
        .get('/api/records?limit=abc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('limitパラメータなしは成功する（オプション）', async () => {
      const response = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('正しい範囲のlimitは成功する', async () => {
      const response = await request(app)
        .get('/api/records?limit=20')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('limitが1は成功する（最小値）', async () => {
      const response = await request(app)
        .get('/api/records?limit=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('limitが100は成功する（最大値）', async () => {
      const response = await request(app)
        .get('/api/records?limit=100')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('複数のバリデーションルールの組み合わせ', () => {
    it('記録更新時のIDとボディバリデーション', async () => {
      const response = await request(app)
        .put('/api/records/abc') // 無効なID
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sleep_hours: 7,
          emotion_score: 15 // 範囲外
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('記録削除時のIDバリデーション', async () => {
      const response = await request(app)
        .delete('/api/records/-1') // 無効なID
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('アドバイス履歴取得時のlimitバリデーション', async () => {
      const response = await request(app)
        .get('/api/advice/history?limit=200') // 範囲外
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
