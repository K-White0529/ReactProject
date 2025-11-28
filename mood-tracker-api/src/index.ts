import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import recordRoutes from './routes/recordRoutes';
import analysisRoutes from './routes/analysisRoutes';
import weatherRoutes from './routes/weatherRoutes';
import adviceRoutes from './routes/adviceRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const startTime = Date.now();

// ミドルウェア
app.use(cors());
app.use(express.json());

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({ 
    message: 'Mood Tracker API v1.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor((Date.now() - startTime) / 1000)
  });
});

// APIルート
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/advice', adviceRoutes);

// 404エラーハンドリング
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'エンドポイントが見つかりません'
  });
});

// サーバー起動
const server = app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
  console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
});

// タイムアウト設定（AI分析用に延長）
server.timeout = 120000; // 120秒（2分）
