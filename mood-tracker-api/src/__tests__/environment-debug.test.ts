/// <reference types="jest" />

/**
 * デバッグ用テスト
 * 環境変数が正しく設定されているか確認
 */

describe('Environment Variables Debug', () => {
  it('NODE_ENV should be "test"', () => {
    console.log('');
    console.log('='.repeat(60));
    console.log('ENVIRONMENT VARIABLES CHECK');
    console.log('='.repeat(60));
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DISABLE_CSRF:', process.env.DISABLE_CSRF);
    console.log('Type of NODE_ENV:', typeof process.env.NODE_ENV);
    console.log('Type of DISABLE_CSRF:', typeof process.env.DISABLE_CSRF);
    console.log('NODE_ENV === "test":', process.env.NODE_ENV === 'test');
    console.log('DISABLE_CSRF === "true":', process.env.DISABLE_CSRF === 'true');
    console.log('='.repeat(60));
    console.log('');
    
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('DISABLE_CSRF should be "true"', () => {
    expect(process.env.DISABLE_CSRF).toBe('true');
  });
});
