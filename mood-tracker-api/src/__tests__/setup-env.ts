/**
 * Jest環境変数セットアップ
 * テストフレームワークのセットアップ前に実行される（最も早い段階）
 */

// 環境変数を強制的に設定
process.env.NODE_ENV = 'test';
process.env.DISABLE_CSRF = 'true';
process.env.CI = 'true';

console.log('');
console.log('='.repeat(60));
console.log('Jest Environment Variables Setup (Early Stage)');
console.log('='.repeat(60));
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DISABLE_CSRF:', process.env.DISABLE_CSRF);
console.log('CI:', process.env.CI);
console.log('='.repeat(60));
console.log('');
