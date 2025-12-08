import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import recordRoutes from './routes/recordRoutes';
import analysisRoutes from './routes/analysisRoutes';
import weatherRoutes from './routes/weatherRoutes';
import adviceRoutes from './routes/adviceRoutes';
import securityRoutes from './routes/securityRoutes';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const startTime = Date.now();

// ===== セキュリティミドルウェア =====

// HTTPS強制リダイレクト（本番環境のみ）
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Helmetによるセキュリティヘッダー設定
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1年
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
}));

// Cookie Parser（CSRF対策で使用）
app.use(cookieParser());

// gzip圧縮
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024 // 1KB以上のレスポンスを圧縮
}));

// CORS設定の強化
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000'
    ].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // originがundefinedの場合（同一オリジン、Postmanなど）は許可
    if (!origin) {
      callback(null, true);
      return;
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 86400, // 24時間
}));

// ===== 基本ミドルウェア =====

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== ルートエンドポイント =====

app.get('/', (req, res) => {
  res.json({ 
    message: 'Mood Tracker API v1.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    security: {
      helmet: 'enabled',
      cors: 'enabled',
      https: process.env.NODE_ENV === 'production' ? 'enforced' : 'optional'
    }
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

// ===== APIルート =====

// セキュリティルート（CSRF保護不要）
app.use('/api/security', securityRoutes);

// 認証ルート（CSRF保護不要 - ログイン・登録）
app.use('/api/auth', authRoutes);

// 保護されたルート
app.use('/api/records', recordRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/advice', adviceRoutes);

// ===== エラーハンドリング =====

// 404エラーハンドラー
app.use(notFoundHandler);

// グローバルエラーハンドラー
app.use(globalErrorHandler);

// ===== サーバー起動 =====

const server = app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
  console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS許可オリジン: ${allowedOrigins.join(', ')}`);
  console.log('セキュリティ: Helmet有効、CORS強化');
});

// タイムアウト設定（AI分析用に延長）
server.timeout = 120000; // 120秒（2分）

export default app;
