/**
 * Jestテストのセットアップファイル
 * すべてのテストファイル実行前に実行される
 */

// テスト環境の環境変数を強制的に設定
process.env.NODE_ENV = 'test';
process.env.DISABLE_CSRF = 'true';

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

console.log('='.repeat(60));
console.log('Test Environment Setup');
console.log('='.repeat(60));
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DISABLE_CSRF:', process.env.DISABLE_CSRF);
console.log('CSRF Protection:', process.env.DISABLE_CSRF === 'true' ? 'DISABLED' : 'ENABLED');
console.log('Rate Limit:', process.env.NODE_ENV !== 'production' ? 'RELAXED (10000)' : 'STRICT');
console.log('='.repeat(60));
console.log('');

// グローバルなbeforeAllで環境変数を再確認
global.beforeAll(() => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('ERROR: NODE_ENV is not "test":', process.env.NODE_ENV);
    throw new Error('NODE_ENV must be "test"');
  }
  if (process.env.DISABLE_CSRF !== 'true') {
    console.error('ERROR: DISABLE_CSRF is not "true":', process.env.DISABLE_CSRF);
    throw new Error('DISABLE_CSRF must be "true"');
  }
});
