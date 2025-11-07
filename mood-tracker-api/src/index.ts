import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import recordRoutes from './routes/recordRoutes';
import analysisRoutes from './routes/analysisRoutes';

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

// 404エラーハンドリング
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'エンドポイントが見つかりません'
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
});