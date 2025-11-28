import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQLの接続プールを作成
// DATABASE_URLが設定されている場合はそれを使用（本番環境）
// 設定されていない場合は個別の環境変数を使用（開発環境）
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }
);

// 接続テスト
pool.on('connect', () => {
  console.log('データベースに接続しました');
});

pool.on('error', (err) => {
  console.error('データベース接続エラー:', err);
});

// 起動時に接続確認
pool.query('SELECT NOW()')
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });

export default pool;
