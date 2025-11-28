import { Pool } from 'pg';

// 環境変数から設定を取得
const isProduction = process.env.NODE_ENV === 'production';

// 接続設定
const config = isProduction
  ? {
      // 本番環境: DATABASE_URL または個別の環境変数を使用
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Render, Supabase, Neon などで必要
      },
    }
  : {
      // 開発環境: 個別の環境変数を使用
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'mood_tracker_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    };

// コネクションプールを作成
const pool = new Pool(config);

// 接続確認
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

// データベース接続テスト関数
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection test successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

export default pool;
