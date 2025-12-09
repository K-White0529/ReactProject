/**
 * Jestテストのセットアップファイル
 * すべてのテストファイル実行前に実行される
 */

import pool from '../config/database';
import bcryptjs from 'bcryptjs';

// テスト環境の環境変数を強制的に設定
process.env.NODE_ENV = 'test';
process.env.DISABLE_CSRF = 'true';
process.env.CI = 'true';

// 環境変数が変更されないようにObject.freezeを使用
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  writable: false,
  configurable: false
});

Object.defineProperty(process.env, 'DISABLE_CSRF', {
  value: 'true',
  writable: false,
  configurable: false
});

Object.defineProperty(process.env, 'CI', {
  value: 'true',
  writable: false,
  configurable: false
});

console.log('='.repeat(60));
console.log('Test Environment Setup');
console.log('='.repeat(60));
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DISABLE_CSRF:', process.env.DISABLE_CSRF);
console.log('CI:', process.env.CI);
console.log('CSRF Protection:', process.env.DISABLE_CSRF === 'true' ? 'DISABLED' : 'ENABLED');
console.log('Rate Limit:', process.env.NODE_ENV !== 'production' ? 'RELAXED (10000)' : 'STRICT');
console.log('='.repeat(60));
console.log('');

/**
 * テストユーザーを作成する
 */
async function createTestUser() {
  try {
    // test_userが既に存在するかチェック
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      ['test_user']
    );

    if (existingUser.rows.length > 0) {
      console.log('[Setup] test_user already exists');
      return;
    }

    // test_userを作成
    const hashedPassword = await bcryptjs.hash('Test1234!', 10);
    await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
      ['test_user', 'test_user@example.com', hashedPassword]
    );

    console.log('[Setup] test_user created successfully');
  } catch (error) {
    console.error('[Setup] Failed to create test_user:', error);
    // テストユーザー作成失敗は致命的ではない（既に存在する可能性）
  }
}

/**
 * テストデータベースをクリーンアップする
 */
async function cleanupTestData() {
  try {
    // テストで作成されたデータを削除（test_user以外のユーザーとそのデータ）
    await pool.query(`
      DELETE FROM records
      WHERE user_id IN (
        SELECT id FROM users WHERE username != 'test_user'
      )
    `);

    await pool.query(`
      DELETE FROM weather_data
      WHERE user_id IN (
        SELECT id FROM users WHERE username != 'test_user'
      )
    `);

    await pool.query(`
      DELETE FROM analysis_answers
      WHERE user_id IN (
        SELECT id FROM users WHERE username != 'test_user'
      )
    `);

    await pool.query(`
      DELETE FROM advice_history
      WHERE user_id IN (
        SELECT id FROM users WHERE username != 'test_user'
      )
    `);

    await pool.query(`
      DELETE FROM users WHERE username != 'test_user'
    `);

    console.log('[Setup] Test data cleaned up');
  } catch (error) {
    console.error('[Setup] Failed to cleanup test data:', error);
  }
}

// グローバルセットアップ（1回だけ実行）
let setupComplete = false;

beforeAll(async () => {
  if (setupComplete) {
    return;
  }

  // 環境変数チェック
  if (process.env.NODE_ENV !== 'test') {
    console.error('ERROR: NODE_ENV is not "test":', process.env.NODE_ENV);
    throw new Error('NODE_ENV must be "test"');
  }
  if (process.env.DISABLE_CSRF !== 'true') {
    console.error('ERROR: DISABLE_CSRF is not "true":', process.env.DISABLE_CSRF);
    throw new Error('DISABLE_CSRF must be "true"');
  }

  // テストユーザーを作成
  await createTestUser();

  setupComplete = true;
}, 30000); // タイムアウトを30秒に設定

// グローバルクリーンアップ
afterAll(async () => {
  try {
    await cleanupTestData();
    await pool.end();
    console.log('[Setup] Database connection closed');
  } catch (error) {
    console.error('[Setup] Cleanup error:', error);
  }
}, 30000); // タイムアウトを30秒に設定
