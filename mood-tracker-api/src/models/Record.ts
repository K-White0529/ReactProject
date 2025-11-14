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

  /**
   * 統計情報を取得
   */
  static async getStats(userId: number): Promise<any> {
    const result = await pool.query(
      `SELECT
        COUNT(*) as total_records,
        COUNT(CASE WHEN recorded_at >= NOW() - INTERVAL '7 days' THEN 1 END) as this_week_records,
        ROUND(AVG(emotion_score), 1) as avg_emotion_score,
        ROUND(AVG(motivation_score), 1) as avg_motivation_score,
        MAX(recorded_at) as latest_record_date
       FROM records
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  }

  /**
   * グラフ用のデータを取得
   * @param userId ユーザーID
   * @param range 表示範囲 ('today' | '3days' | '1week' | '3weeks')
   */
  static async getChartData(userId: number, range: string = '3weeks') {
    // 範囲と集約単位の設定
    let intervalClause: string;
    let truncExpression: string;
    let dateFormat: string;

    switch (range) {
      case 'today':
        intervalClause = "AND recorded_at >= CURRENT_DATE";
        // 5分単位
        truncExpression = "date_trunc('hour', recorded_at) + (EXTRACT(MINUTE FROM recorded_at)::int / 5) * INTERVAL '5 minutes'";
        dateFormat = 'MM/DD HH24:MI';
        break;
      case '3days':
        intervalClause = "AND recorded_at >= NOW() - INTERVAL '3 days'";
        // 15分単位
        truncExpression = "date_trunc('hour', recorded_at) + (EXTRACT(MINUTE FROM recorded_at)::int / 15) * INTERVAL '15 minutes'";
        dateFormat = 'MM/DD HH24:MI';
        break;
      case '1week':
        intervalClause = "AND recorded_at >= NOW() - INTERVAL '7 days'";
        // 30分単位
        truncExpression = "date_trunc('hour', recorded_at) + (EXTRACT(MINUTE FROM recorded_at)::int / 30) * INTERVAL '30 minutes'";
        dateFormat = 'MM/DD HH24:MI';
        break;
      case '3weeks':
      default:
        intervalClause = "AND recorded_at >= NOW() - INTERVAL '21 days'";
        // 1時間単位
        truncExpression = "date_trunc('hour', recorded_at)";
        dateFormat = 'MM/DD HH24:00';
        break;
    }

    const result = await pool.query(
      `SELECT
        TO_CHAR(${truncExpression}, '${dateFormat}') as date,
        ROUND(AVG(emotion_score)::numeric, 1) as avg_emotion,
        ROUND(AVG(motivation_score)::numeric, 1) as avg_motivation
       FROM records
       WHERE user_id = $1
         ${intervalClause}
       GROUP BY ${truncExpression}
       ORDER BY ${truncExpression} ASC`,
      [userId]
    );

    return result.rows;
  }

  /**
   * 気象データを含むグラフデータを取得（記録がある日付のみ）
   * @param userId ユーザーID
   * @param range 表示範囲 ('today' | '3days' | '1week' | '3weeks')
   */
  static async getWeatherChartData(userId: number, range: string = '3weeks') {
    try {
      // 範囲と集約単位の設定
      let intervalClause: string;
      let truncExpression: string;
      let dateFormat: string;

      switch (range) {
        case 'today':
          intervalClause = "AND r.recorded_at >= CURRENT_DATE";
          // 5分単位
          truncExpression = "date_trunc('hour', r.recorded_at) + (EXTRACT(MINUTE FROM r.recorded_at)::int / 5) * INTERVAL '5 minutes'";
          dateFormat = 'MM/DD HH24:MI';
          break;
        case '3days':
          intervalClause = "AND r.recorded_at >= NOW() - INTERVAL '3 days'";
          // 15分単位
          truncExpression = "date_trunc('hour', r.recorded_at) + (EXTRACT(MINUTE FROM r.recorded_at)::int / 15) * INTERVAL '15 minutes'";
          dateFormat = 'MM/DD HH24:MI';
          break;
        case '1week':
          intervalClause = "AND r.recorded_at >= NOW() - INTERVAL '7 days'";
          // 30分単位
          truncExpression = "date_trunc('hour', r.recorded_at) + (EXTRACT(MINUTE FROM r.recorded_at)::int / 30) * INTERVAL '30 minutes'";
          dateFormat = 'MM/DD HH24:MI';
          break;
        case '3weeks':
        default:
          intervalClause = "AND r.recorded_at >= NOW() - INTERVAL '21 days'";
          // 1時間単位
          truncExpression = "date_trunc('hour', r.recorded_at)";
          dateFormat = 'MM/DD HH24:00';
          break;
      }

      const result = await pool.query(
        `SELECT
          TO_CHAR(${truncExpression}, '${dateFormat}') as date,
          ROUND(AVG(w.temperature)::numeric, 1) as avg_temperature,
          ROUND(AVG(w.humidity)::numeric, 1) as avg_humidity,
          MODE() WITHIN GROUP (ORDER BY w.weather_condition) as weather_condition
         FROM records r
         LEFT JOIN weather_data w ON DATE(r.recorded_at) = DATE(w.recorded_at)
           AND r.user_id = w.user_id
         WHERE r.user_id = $1
           ${intervalClause}
         GROUP BY ${truncExpression}
         ORDER BY ${truncExpression} ASC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Weather chart data error:', error);
      return [];
    }
  }
}