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

// ミドルウェア
app.use(cors());
app.use(express.json());

// ルート
app.get('/', (req, res) => {
  res.json({ message: 'Mood Tracker API v1.0' });
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
    message: 'エンドポイントが見つかりません'
  });
});

// サーバー起動
const server = app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
});

// タイムアウト設定（AI分析用に延長）
server.timeout = 120000; // 120秒（2分）