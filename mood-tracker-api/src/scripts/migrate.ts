import fs from 'fs';
import path from 'path';
import pool from '../config/database';

async function runMigration() {
  try {
    console.log('マイグレーションを開始します...');

    // マイグレーションファイルの読み込み
    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`実行中: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');

        await pool.query(sql);
        console.log(`完了: ${file}`);
      }
    }

    console.log('すべてのマイグレーションが完了しました');
    process.exit(0);
  } catch (error) {
    console.error('マイグレーションエラー:', error);
    process.exit(1);
  }
}

runMigration();