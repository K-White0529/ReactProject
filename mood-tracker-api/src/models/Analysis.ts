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

  /**
   * AI生成された質問をデータベースに保存
   */
  static async saveGeneratedQuestions(categoryId: number, questions: string[]) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const savedQuestions = [];

      for (const questionText of questions) {
        const result = await client.query(
          `INSERT INTO analysis_questions (category_id, question_text, is_active, generated_by_ai, usage_count)
           VALUES ($1, $2, true, true, 0)
           RETURNING *`,
          [categoryId, questionText]
        );

        savedQuestions.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return savedQuestions;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 観点別の平均スコアを取得
   */
  static async getCategoryAverageScores(
    userId: number,
    startDate: Date,
    endDate: Date
  ) {
    const result = await pool.query(
      `SELECT
        c.id as category_id,
        c.code as category_code,
        c.name as category_name,
        ROUND(AVG(aa.answer_score)::numeric, 1) as avg_score,
        COUNT(aa.id) as answer_count
       FROM analysis_categories c
       LEFT JOIN analysis_questions q ON c.id = q.category_id AND q.is_active = true
       LEFT JOIN analysis_answers aa ON q.id = aa.question_id
         AND aa.user_id = $1
         AND aa.answered_at >= $2
         AND aa.answered_at <= $3
       GROUP BY c.id, c.code, c.name
       ORDER BY c.id`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }

  /**
   * 観点別のスコア遷移データを取得（日次集計）
   */
  static async getCategoryScoreTrends(
    userId: number,
    startDate: Date,
    endDate: Date
  ) {
    const result = await pool.query(
      `SELECT
        c.id as category_id,
        c.code as category_code,
        c.name as category_name,
        DATE(aa.answered_at) as date,
        ROUND(AVG(aa.answer_score)::numeric, 1) as avg_score,
        COUNT(aa.id) as answer_count
       FROM analysis_categories c
       JOIN analysis_questions q ON c.id = q.category_id AND q.is_active = true
       JOIN analysis_answers aa ON q.id = aa.question_id
         AND aa.user_id = $1
         AND aa.answered_at >= $2
         AND aa.answered_at <= $3
       GROUP BY c.id, c.code, c.name, DATE(aa.answered_at)
       ORDER BY DATE(aa.answered_at), c.id`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }

  /**
   * 各カテゴリからランダムに指定数の質問を取得
   */
  static async getRandomQuestionsByCategory(questionsPerCategory: number = 5) {
    const result = await pool.query(
      `SELECT
        q.id,
        q.category_id,
        q.question_text,
        c.name as category_name,
        c.code as category_code
       FROM (
         SELECT
           id,
           category_id,
           question_text,
           ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY RANDOM()) as rn
         FROM analysis_questions
         WHERE is_active = true
       ) q
       JOIN analysis_categories c ON q.category_id = c.id
       WHERE q.rn <= $1
       ORDER BY RANDOM()`,
      [questionsPerCategory]
    );
    return result.rows;
  }
}