import pool from '../config/database';

export interface WeatherDataRow {
  id: number;
  user_id: number;
  temperature: number;
  humidity: number;
  weather_condition: string;
  location?: string;
  recorded_at: Date;
}

export class WeatherDataModel {
  /**
   * 気象データを保存
   */
  static async create(
    userId: number,
    temperature: number,
    humidity: number,
    weatherCondition: string,
    location?: string
  ): Promise<WeatherDataRow> {
    const result = await pool.query(
      `INSERT INTO weather_data (user_id, temperature, humidity, weather_condition, location, recorded_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [userId, temperature, humidity, weatherCondition, location]
    );

    return result.rows[0];
  }

  /**
   * 指定日時の気象データを取得
   */
  static async getByUserAndDate(userId: number, date: Date): Promise<WeatherDataRow | null> {
    const result = await pool.query(
      `SELECT * FROM weather_data
       WHERE user_id = $1 AND DATE(recorded_at) = DATE($2)
       ORDER BY recorded_at DESC
       LIMIT 1`,
      [userId, date]
    );

    return result.rows[0] || null;
  }

  /**
   * 記録IDに紐づく気象データを取得
   * recordsテーブルのrecorded_atに最も近い時刻の気象データを返す
   */
  static async getByRecordId(recordId: number, userId: number): Promise<WeatherDataRow | null> {
    const result = await pool.query(
      `SELECT w.*
       FROM weather_data w
       INNER JOIN records r ON r.user_id = w.user_id
       WHERE r.id = $1 AND r.user_id = $2
       ORDER BY ABS(EXTRACT(EPOCH FROM (w.recorded_at - r.recorded_at)))
       LIMIT 1`,
      [recordId, userId]
    );

    return result.rows[0] || null;
  }
}