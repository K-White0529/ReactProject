/**
 * Jestテストのセットアップファイル
 * すべてのテストファイル実行前に1回だけ実行される
 */

// テスト環境の環境変数を設定
process.env.NODE_ENV = 'test';
process.env.DISABLE_CSRF = 'true';

console.log('='.repeat(60));
console.log('Test Environment Setup');
console.log('='.repeat(60));
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DISABLE_CSRF:', process.env.DISABLE_CSRF);
console.log('CSRF Protection:', process.env.DISABLE_CSRF === 'true' ? 'DISABLED' : 'ENABLED');
console.log('='.repeat(60));
console.log('');
