import pool from '../config/database';
import { Record, RecordInput } from '../types';

export class RecordModel {
  /**
   * ユーザーのすべての記録を取得
   */
  static async findByUserId(userId: number, limit = 100): Promise<Record[]> {
    const result = await pool.query(
      `SELECT * FROM records
       WHERE user_id = $1
       ORDER BY recorded_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  /**
   * IDで記録を取得
   */
  static async findById(id: number, userId: number): Promise<Record | null> {
    const result = await pool.query(
      'SELECT * FROM records WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] || null;
  }

  /**
   * 新しい記録を作成
   */
  static async create(userId: number, recordData: RecordInput): Promise<Record> {
    const {
      recorded_at = new Date(),
      sleep_hours,
      sleep_quality,
      meal_quality,
      meal_regularity,
      exercise_minutes,
      exercise_intensity,
      emotion_score,
      emotion_note,
      motivation_score,
      activities_done
    } = recordData;

    const result = await pool.query(
      `INSERT INTO records (
        user_id, recorded_at,
        sleep_hours, sleep_quality,
        meal_quality, meal_regularity,
        exercise_minutes, exercise_intensity,
        emotion_score, emotion_note,
        motivation_score, activities_done
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        userId, recorded_at,
        sleep_hours, sleep_quality,
        meal_quality, meal_regularity,
        exercise_minutes, exercise_intensity,
        emotion_score, emotion_note,
        motivation_score, activities_done
      ]
    );
    return result.rows[0];
  }

  /**
   * 記録を更新
   */
  static async update(
    id: number,
    userId: number,
    recordData: RecordInput
  ): Promise<Record | null> {
    const {
      sleep_hours,
      sleep_quality,
      meal_quality,
      meal_regularity,
      exercise_minutes,
      exercise_intensity,
      emotion_score,
      emotion_note,
      motivation_score,
      activities_done
    } = recordData;

    const result = await pool.query(
      `UPDATE records SET
        sleep_hours = COALESCE($3, sleep_hours),
        sleep_quality = COALESCE($4, sleep_quality),
        meal_quality = COALESCE($5, meal_quality),
        meal_regularity = COALESCE($6, meal_regularity),
        exercise_minutes = COALESCE($7, exercise_minutes),
        exercise_intensity = COALESCE($8, exercise_intensity),
        emotion_score = COALESCE($9, emotion_score),
        emotion_note = COALESCE($10, emotion_note),
        motivation_score = COALESCE($11, motivation_score),
        activities_done = COALESCE($12, activities_done),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *`,
      [
        id, userId,
        sleep_hours, sleep_quality,
        meal_quality, meal_regularity,
        exercise_minutes, exercise_intensity,
        emotion_score, emotion_note,
        motivation_score, activities_done
      ]
    );
    return result.rows[0] || null;
  }

  /**
   * 記録を削除
   */
  static async delete(id: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM records WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
}