import pool from '../config/database';

export class AnalysisModel {
  /**
   * すべての分析観点を取得
   */
  static async getAllCategories() {
    const result = await pool.query(
      'SELECT * FROM analysis_categories ORDER BY id'
    );
    return result.rows;
  }

  /**
   * 有効な質問を取得
   */
  static async getActiveQuestions() {
    const result = await pool.query(
      `SELECT q.*, c.name as category_name, c.code as category_code
       FROM analysis_questions q
       JOIN analysis_categories c ON q.category_id = c.id
       WHERE q.is_active = true
       ORDER BY c.id, q.id`
    );
    return result.rows;
  }

  /**
   * 回答を保存
   */
  static async saveAnswers(userId: number, answers: any[]) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const answer of answers) {
        await client.query(
          `INSERT INTO analysis_answers (user_id, record_id, question_id, answer_score)
           VALUES ($1, $2, $3, $4)`,
          [userId, answer.record_id || null, answer.question_id, answer.answer_score]
        );

        // 質問の使用回数を更新
        await client.query(
          `UPDATE analysis_questions
           SET usage_count = usage_count + 1
           WHERE id = $1`,
          [answer.question_id]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}