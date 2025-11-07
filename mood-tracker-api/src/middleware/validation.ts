import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * バリデーション結果をチェック
 */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'バリデーションエラー',
      errors: errors.array()
    });
    return;
  }

  next();
}

/**
 * ユーザー登録のバリデーションルール
 */
export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('ユーザー名は3文字以上50文字以内で入力してください'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('有効なメールアドレスを入力してください'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('パスワードは6文字以上で入力してください')
];

/**
 * ログインのバリデーションルール
 */
export const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('ユーザー名を入力してください'),
  body('password')
    .notEmpty()
    .withMessage('パスワードを入力してください')
];

/**
 * 記録作成のバリデーションルール
 */
export const recordValidation = [
  body('sleep_hours')
    .optional()
    .isFloat({ min: 0, max: 24 })
    .withMessage('睡眠時間は0～24時間の範囲で入力してください'),
  body('sleep_quality')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('睡眠の質は1～10の範囲で入力してください'),
  body('meal_quality')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('食事の質は1～10の範囲で入力してください'),
  body('meal_regularity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('食事の規則性は1～10の範囲で入力してください'),
  body('exercise_minutes')
    .optional()
    .isInt({ min: 0 })
    .withMessage('運動時間は0以上の整数で入力してください'),
  body('exercise_intensity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('運動強度は1～10の範囲で入力してください'),
  body('emotion_score')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('感情スコアは1～10の範囲で入力してください'),
  body('motivation_score')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('モチベーションは1～10の範囲で入力してください'),
  body('emotion_note')
    .optional()
    .trim(),
  body('activities_done')
    .optional()
    .trim()
];