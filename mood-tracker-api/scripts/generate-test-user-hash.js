/**
 * テストユーザーのパスワードハッシュを生成
 * 実行: node scripts/generate-test-user-hash.js
 */
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;
const password = 'Test1234!';

async function generateHash() {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  console.log('\n=== Test User Password Hash ===');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\n✅ Use this hash in the migration SQL');
}

generateHash().catch(console.error);
