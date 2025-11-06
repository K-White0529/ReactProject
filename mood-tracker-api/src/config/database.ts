import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQLの接続プールを作成
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// 接続テスト
pool.on('connect', () => {
  console.log('データベースに接続しました');
});

pool.on('error', (err) => {
  console.error('データベース接続エラー:', err);
});

export default pool;