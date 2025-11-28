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
}
