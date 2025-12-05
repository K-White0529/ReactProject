/**
 * テストユーザーのパスワードハッシュを生成するスクリプト
 * 
 * 実行方法:
 * node scripts/generate-test-user-hash.js
 */

const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;
const TEST_PASSWORD = 'Test1234!';

async function generateHash() {
  try {
    const hash = await bcrypt.hash(TEST_PASSWORD, SALT_ROUNDS);
    console.log('Password:', TEST_PASSWORD);
    console.log('Hash:', hash);
    console.log('\nSQL statement:');
    console.log(`INSERT INTO users (username, email, password_hash) VALUES`);
    console.log(`('test_user', 'test@example.com', '${hash}')`);
    console.log(`ON CONFLICT (username) DO NOTHING;`);
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generateHash();
