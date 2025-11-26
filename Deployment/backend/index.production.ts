import express from 'express';
import dotenv from 'dotenv';
import { configureCORS } from './config/cors.config';
import { configureSecurity, configureRateLimiting } from './config/security.config';
import { testConnection } from './config/database';

// ルートのインポート
import authRoutes from './routes/authRoutes';
import recordRoutes from './routes/recordRoutes';
import analysisRoutes from './routes/analysisRoutes';
import weatherRoutes from './routes/weatherRoutes';
import adviceRoutes from './routes/adviceRoutes';

// 環境変数の読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// ミドルウェア設定
app.use(express.json({ limit: '10mb' })); // JSONボディのサイズ制限
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS設定
configureCORS(app);

// セキュリティ設定（本番環境のみ）
if (isProduction) {
  configureSecurity(app);
  configureRateLimiting(app);
}

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
  });
});

// ルート設定
app.get('/', (req, res) => {
  res.json({
    message: 'Mood Tracker API v1.0',
    status: 'running',
    environment: process.env.NODE_ENV,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/advice', adviceRoutes);

// 404エラーハンドリング
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'エンドポイントが見つかりません',
    path: req.path,
  });
});

// エラーハンドリング
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  // 本番環境ではスタックトレースを隠す
  const errorResponse = {
    success: false,
    message: isProduction ? 'サーバーエラーが発生しました' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  };

  res.status(err.status || 500).json(errorResponse);
});

// データベース接続確認後にサーバー起動
async function startServer() {
  try {
    // データベース接続テスト
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    // サーバー起動
    app.listen(PORT, () => {
      console.log('');
      console.log('=================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log('=================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// サーバー起動
startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
