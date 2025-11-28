import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { hashPassword, verifyPassword } from '../utils/passwordHelper';
import { UserRegistration, UserLogin, JwtPayload } from '../types';

/**
 * ユーザー登録
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password }: UserRegistration = req.body;

    // ユーザー名の重複チェック
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'このユーザー名は既に使用されています'
      });
      return;
    }

    // メールアドレスの重複チェック
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      res.status(400).json({
        success: false,
        message: 'このメールアドレスは既に使用されています'
      });
      return;
    }

    // パスワードをハッシュ化
    const password_hash = await hashPassword(password);

    // ユーザーを作成
    const user = await UserModel.create({ username, email, password, password_hash });

    // JWTトークンを生成
    const token = generateToken(user.id, user.username);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      },
      message: 'ユーザー登録が完了しました'
    });
  } catch (error) {
    console.error('登録エラー:', error);
    res.status(500).json({
      success: false,
      message: 'ユーザー登録に失敗しました'
    });
  }
}

/**
 * ログイン
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password }: UserLogin = req.body;

    // ユーザーを検索
    const user = await UserModel.findByUsername(username);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'ユーザー名またはパスワードが正しくありません'
      });
      return;
    }

    // パスワードを検証
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({
        success: false,
        message: 'ユーザー名またはパスワードが正しくありません'
      });
      return;
    }

    // JWTトークンを生成
    const token = generateToken(user.id, user.username);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      },
      message: 'ログインに成功しました'
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({
      success: false,
      message: 'ログインに失敗しました'
    });
  }
}

/**
 * 現在のユーザー情報を取得
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりませんでした'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    res.status(500).json({
      success: false,
      message: 'ユーザー情報の取得に失敗しました'
    });
  }
}

/**
 * JWTトークンを生成
 */
function generateToken(userId: number, username: string): string {
  const payload: JwtPayload = { userId, username };
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}