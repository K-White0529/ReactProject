import pool from '../config/database';
import { User } from '../types';

export class UserModel {
  /**
   * ユーザー名でユーザーを検索
   */
  static async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  /**
   * メールアドレスでユーザーを検索
   */
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * IDでユーザーを検索
   */
  static async findById(id: number): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * 新しいユーザーを作成
   */
  static async create(userData: {
    username: string;
    email: string;
    password_hash: string;
  }): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userData.username, userData.email, userData.password_hash]
    );
    return result.rows[0];
  }

  /**
   * ユーザーを削除（テスト用）
   * 関連データも全て削除される（CASCADE設定）
   */
  static async delete(userId: number): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1',
        [userId]
      );
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('ユーザー削除エラー:', error);
      throw error;
    }
  }

  /**
   * ユーザー名でユーザーを削除（テスト用）
   */
  static async deleteByUsername(username: string): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM users WHERE username = $1',
        [username]
      );
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('ユーザー削除エラー:', error);
      throw error;
    }
  }

  /**
   * テストユーザーを一括削除（testuserで始まるユーザーを全て削除）
   */
  static async deleteTestUsers(): Promise<number> {
    try {
      const result = await pool.query(
        "DELETE FROM users WHERE username LIKE 'testuser%'"
      );
      return result.rowCount || 0;
    } catch (error) {
      console.error('テストユーザー一括削除エラー:', error);
      throw error;
    }
  }
}
