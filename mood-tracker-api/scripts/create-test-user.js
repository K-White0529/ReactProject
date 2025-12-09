/**
 * CI環境でテストユーザーを作成するスクリプト
 * 
 * 使用方法:
 * DATABASE_URL=postgresql://... node scripts/create-test-user.js
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

async function createTestUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Creating test user...');
    
    const username = 'test_user';
    const email = 'test_user@example.com';
    const password = 'Test1234!';
    
    // パスワードをハッシュ化
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // ユーザーを作成（既存の場合は更新）
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) 
       DO UPDATE SET 
         email = EXCLUDED.email,
         password_hash = EXCLUDED.password_hash,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, username, email`,
      [username, email, passwordHash]
    );
    
    console.log('Test user created successfully:');
    console.log('ID:', result.rows[0].id);
    console.log('Username:', result.rows[0].username);
    console.log('Email:', result.rows[0].email);
    console.log('Password:', password);
    
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createTestUser();
