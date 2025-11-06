import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェアの設定
app.use(cors()); // CORS有効化
app.use(express.json()); // JSONボディのパース

// ルートエンドポイント
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Mood Tracker API' });
});

// テストエンドポイント: データベースからデータを取得
app.get('/api/test', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM test_table');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('データベースエラー:', error);
    res.status(500).json({
      success: false,
      message: 'データベースエラーが発生しました'
    });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
});

// CREATE: 新しいデータを追加
app.post('/api/test', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'nameは必須です'
      });
    }

    const result = await pool.query(
      'INSERT INTO test_table (name) VALUES ($1) RETURNING *',
      [name]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('データ追加エラー:', error);
    res.status(500).json({
      success: false,
      message: 'データ追加に失敗しました'
    });
  }
});

// UPDATE: データを更新
app.put('/api/test/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'nameは必須です'
      });
    }

    const result = await pool.query(
      'UPDATE test_table SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'データが見つかりませんでした'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('データ更新エラー:', error);
    res.status(500).json({
      success: false,
      message: 'データ更新に失敗しました'
    });
  }
});

// DELETE: データを削除
app.delete('/api/test/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM test_table WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'データが見つかりませんでした'
      });
    }

    res.json({
      success: true,
      message: 'データを削除しました',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('データ削除エラー:', error);
    res.status(500).json({
      success: false,
      message: 'データ削除に失敗しました'
    });
  }
});