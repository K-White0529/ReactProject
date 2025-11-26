import pool from '../config/database';

export interface AdviceRow {
  id: number;
  user_id: number;
  advice_text: string;
  advice_type: string;
  created_at: Date;
}

export class AdviceModel {
  /**
   * アドバイスを保存
   */
  static async create(
    userId: number,
    adviceText: string,
    adviceType: string = 'personalized'
  ): Promise<AdviceRow> {
    const result = await pool.query(
      `INSERT INTO advice_history (user_id, advice_text, advice_type, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [userId, adviceText, adviceType]
    );

    return result.rows[0];
  }

  /**
   * ユーザーの最新のアドバイスを取得
   */
  static async getLatest(userId: number, limit: number = 1): Promise<AdviceRow[]> {
    const result = await pool.query(
      `SELECT * FROM advice_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }

  /**
   * ユーザーのアドバイス履歴を取得
   */
  static async getHistory(userId: number, limit: number = 10): Promise<AdviceRow[]> {
    const result = await pool.query(
      `SELECT * FROM advice_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }

  /**
   * 特定のアドバイスを取得
   */
  static async getById(id: number, userId: number): Promise<AdviceRow | null> {
    const result = await pool.query(
      `SELECT * FROM advice_history
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    return result.rows[0] || null;
  }

  /**
   * アドバイスを削除
   */
  static async delete(id: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM advice_history
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );

    return result.rows.length > 0;
  }
}
