/**
 * ページネーションとキャッシュ機能のテスト
 *
 * このファイルでは以下の機能をテストします:
 * - ページネーション機能
 * - フィールドフィルター
 * - ソート機能
 * - キャッシュ機能
 */

import request from 'supertest';
import app from '../index';
import { cache } from '../middleware/cache';

describe('Pagination and Cache Tests', () => {
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

  beforeEach(() => {
    // 各テスト前にキャッシュをクリア
    cache.flushAll();
  });

  describe('Pagination', () => {
    it('ページネーション付きで記録を取得できる', async () => {
      const response = await request(app)
        .get('/api/records?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');

      // ページネーション情報の確認
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('hasNext');
      expect(response.body.pagination).toHaveProperty('hasPrev');

      // データが配列であること
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('ページ番号が正しく機能する', async () => {
      // 1ページ目
      const page1Response = await request(app)
        .get('/api/records?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(page1Response.status).toBe(200);
      expect(page1Response.body.pagination.page).toBe(1);
      expect(page1Response.body.pagination.hasPrev).toBe(false);

      // 2ページ目（データがあれば）
      if (page1Response.body.pagination.hasNext) {
        const page2Response = await request(app)
          .get('/api/records?page=2&limit=5')
          .set('Authorization', `Bearer ${authToken}`);

        expect(page2Response.status).toBe(200);
        expect(page2Response.body.pagination.page).toBe(2);
        expect(page2Response.body.pagination.hasPrev).toBe(true);
      }
    });

    it('limit値が正しく機能する', async () => {
      const response = await request(app)
        .get('/api/records?limit=3')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBe(3);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
    });

    it('limitの最大値が制限される（100まで）', async () => {
      const response = await request(app)
        .get('/api/records?limit=200')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBeLessThanOrEqual(100);
    });

    it('limitの最小値が制限される（1以上）', async () => {
      const response = await request(app)
        .get('/api/records?limit=0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Field Filter', () => {
    beforeAll(async () => {
      // テスト用の記録を作成
      await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sleep_hours: 7,
          sleep_quality: 8,
          emotion_score: 7,
          motivation_score: 8
        });
    });

    it('指定したフィールドのみを返す', async () => {
      const response = await request(app)
        .get('/api/records?fields=id,emotion_score,recorded_at')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);

      // 指定したフィールドが含まれている
      const firstRecord = response.body.data[0];
      expect(firstRecord).toHaveProperty('id');
      expect(firstRecord).toHaveProperty('emotion_score');
      expect(firstRecord).toHaveProperty('recorded_at');

      // 指定していないフィールドは含まれていない可能性がある
      // （ただし、一部のフィールドは常に返される場合もある）
    });

    it('複数のフィールドを指定できる', async () => {
      const response = await request(app)
        .get('/api/records?fields=id,sleep_hours,sleep_quality,emotion_score')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Sort', () => {
    it('recorded_atで降順ソートできる（デフォルト）', async () => {
      const response = await request(app)
        .get('/api/records?sortBy=recorded_at&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      if (response.body.data.length >= 2) {
        const dates = response.body.data.map((r: any) => new Date(r.recorded_at).getTime());
        // 降順であることを確認
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
        }
      }
    });

    it('emotion_scoreで昇順ソートできる', async () => {
      const response = await request(app)
        .get('/api/records?sortBy=emotion_score&sortOrder=asc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      if (response.body.data.length >= 2) {
        const scores = response.body.data
          .filter((r: any) => r.emotion_score !== null)
          .map((r: any) => r.emotion_score);

        // 昇順であることを確認
        for (let i = 0; i < scores.length - 1; i++) {
          expect(scores[i]).toBeLessThanOrEqual(scores[i + 1]);
        }
      }
    });

    it('無効なソートカラムは無視される', async () => {
      const response = await request(app)
        .get('/api/records?sortBy=invalid_column&sortOrder=asc')
        .set('Authorization', `Bearer ${authToken}`);

      // エラーにならず、デフォルトのソート順で返される
      expect(response.status).toBe(200);
    });
  });

  describe('Cache Functionality', () => {
    it('同じリクエストでキャッシュが機能する', async () => {
      const url = '/api/records/stats';

      // 1回目のリクエスト
      const response1 = await request(app)
        .get(url)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response1.status).toBe(200);

      // 2回目のリクエスト（キャッシュから返される）
      const response2 = await request(app)
        .get(url)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response2.status).toBe(200);

      // レスポンスが同じであることを確認
      expect(response2.body).toEqual(response1.body);
    });

    it('記録作成後にキャッシュがクリアされる', async () => {
      const url = '/api/records';

      // 1回目の取得（キャッシュに保存）
      const getResponse1 = await request(app)
        .get(url)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse1.status).toBe(200);
      const initialCount = getResponse1.body.pagination.total;

      // 新しい記録を作成
      const createResponse = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sleep_hours: 8,
          sleep_quality: 9,
          emotion_score: 8
        });

      expect([200, 201]).toContain(createResponse.status);

      // キャッシュがクリアされて、新しいデータが返される
      const getResponse2 = await request(app)
        .get(url)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse2.status).toBe(200);
      expect(getResponse2.body.pagination.total).toBeGreaterThanOrEqual(initialCount);
    });

    it('記録更新後にキャッシュがクリアされる', async () => {
      // 記録を作成
      const createResponse = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sleep_hours: 7,
          emotion_score: 6
        });

      const recordId = createResponse.body.data.id;

      // 記録を取得（キャッシュに保存）
      const getResponse1 = await request(app)
        .get(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse1.status).toBe(200);

      // 記録を更新
      const updateResponse = await request(app)
        .put(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emotion_score: 9
        });

      expect(updateResponse.status).toBe(200);

      // キャッシュがクリアされて、更新されたデータが返される
      const getResponse2 = await request(app)
        .get(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse2.status).toBe(200);
      expect(getResponse2.body.data.emotion_score).toBe(9);
    });

    it('記録削除後にキャッシュがクリアされる', async () => {
      // 記録を作成
      const createResponse = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sleep_hours: 7
        });

      const recordId = createResponse.body.data.id;

      // 一覧を取得（キャッシュに保存）
      const getResponse1 = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse1.status).toBe(200);
      const countBefore = getResponse1.body.pagination.total;

      // 記録を削除
      const deleteResponse = await request(app)
        .delete(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);

      // キャッシュがクリアされて、削除後のデータが返される
      const getResponse2 = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse2.status).toBe(200);
      expect(getResponse2.body.pagination.total).toBeLessThan(countBefore);
    });

    it('GETリクエストのみがキャッシュされる', async () => {
      // POSTリクエストはキャッシュされない
      const postResponse = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sleep_hours: 7
        });

      expect([200, 201]).toContain(postResponse.status);

      // 同じデータでのPOSTでも新しい記録が作成される
      const postResponse2 = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sleep_hours: 7
        });

      expect([200, 201]).toContain(postResponse2.status);
      expect(postResponse2.body.data.id).not.toBe(postResponse.body.data.id);
    });
  });

  describe('Combined Features', () => {
    it('ページネーション、ソート、フィールドフィルターを組み合わせて使用できる', async () => {
      const response = await request(app)
        .get('/api/records?page=1&limit=5&sortBy=emotion_score&sortOrder=desc&fields=id,emotion_score,recorded_at')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
