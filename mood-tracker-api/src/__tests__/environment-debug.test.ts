/// <reference types="jest" />

/**
 * デバッグ用テスト
 * 環境変数が正しく設定されているか確認
 */

import request from 'supertest';
import app from '../index';

describe('Environment Variables Debug', () => {
  it('NODE_ENV should be "test"', () => {
    console.log('');
    console.log('='.repeat(60));
    console.log('ENVIRONMENT VARIABLES CHECK');
    console.log('='.repeat(60));
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DISABLE_CSRF:', process.env.DISABLE_CSRF);
    console.log('CI:', process.env.CI);
    console.log('Type of NODE_ENV:', typeof process.env.NODE_ENV);
    console.log('Type of DISABLE_CSRF:', typeof process.env.DISABLE_CSRF);
    console.log('Type of CI:', typeof process.env.CI);
    console.log('NODE_ENV === "test":', process.env.NODE_ENV === 'test');
    console.log('DISABLE_CSRF === "true":', process.env.DISABLE_CSRF === 'true');
    console.log('CI === "true":', process.env.CI === 'true');
    console.log('='.repeat(60));
    console.log('');
    
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('DISABLE_CSRF should be "true"', () => {
    expect(process.env.DISABLE_CSRF).toBe('true');
  });

  it('CI should be "true"', () => {
    expect(process.env.CI).toBe('true');
  });
});

describe('Login and CSRF Debug', () => {
  it('test_user should be able to login', async () => {
    console.log('');
    console.log('='.repeat(60));
    console.log('LOGIN TEST');
    console.log('='.repeat(60));
    
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'test_user',
        password: 'Test1234!'
      });

    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    console.log('='.repeat(60));
    console.log('');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('token');
  });

  it('POST request with token should not return 403', async () => {
    console.log('');
    console.log('='.repeat(60));
    console.log('CSRF PROTECTION TEST');
    console.log('='.repeat(60));
    
    // ログイン
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'test_user',
        password: 'Test1234!'
      });

    const token = loginResponse.body.data.token;
    console.log('Token obtained:', token ? 'Yes' : 'No');

    // POSTリクエストを送信
    const response = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${token}`)
      .send({
        sleep_hours: 7,
        sleep_quality: 8
      });

    console.log('POST /api/records response status:', response.status);
    console.log('POST /api/records response body:', JSON.stringify(response.body, null, 2));
    console.log('='.repeat(60));
    console.log('');

    // 403エラーが返されないことを確認
    expect(response.status).not.toBe(403);
    expect([200, 201, 400]).toContain(response.status);
  });

  it('POST /api/analysis/answers should not return 403', async () => {
    console.log('');
    console.log('='.repeat(60));
    console.log('ANALYSIS ROUTES CSRF TEST');
    console.log('='.repeat(60));
    
    // ログイン
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'test_user',
        password: 'Test1234!'
      });

    const token = loginResponse.body.data.token;

    // POSTリクエストを送信
    const response = await request(app)
      .post('/api/analysis/answers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        answers: [
          {
            question_id: 1,
            answer_score: 7
          }
        ]
      });

    console.log('POST /api/analysis/answers response status:', response.status);
    console.log('POST /api/analysis/answers response body:', JSON.stringify(response.body, null, 2));
    console.log('='.repeat(60));
    console.log('');

    // 403エラーが返されないことを確認
    expect(response.status).not.toBe(403);
    expect([200, 201, 400, 404]).toContain(response.status);
  });
});
