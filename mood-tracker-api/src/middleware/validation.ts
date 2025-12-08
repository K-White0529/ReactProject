import { body, validationResult, query, param } from 'express-validator';
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
];

/**
 * 分析回答のバリデーションルール
 */
export const answersValidation = [
  body('answers')
    .isArray({ min: 1 })
    .withMessage('回答は配列で、最低1つ必要です'),
  body('answers.*.question_id')
    .isInt({ min: 1 })
    .withMessage('質問IDは正の整数である必要があります'),
  body('answers.*.answer_score')
    .isInt({ min: 1, max: 10 })
    .withMessage('回答スコアは1～10の範囲で入力してください'),
  body('answers.*.record_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('記録IDは正の整数である必要があります')
];

/**
 * AI質問生成のバリデーションルール
 */
export const generateQuestionsValidation = [
  body('category_code')
    .trim()
    .notEmpty()
    .withMessage('カテゴリコードを入力してください')
    .isLength({ max: 50 })
    .withMessage('カテゴリコードは50文字以内で入力してください'),
  body('count')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('生成数は1～10の範囲で入力してください')
];

/**
 * クエリパラメータのバリデーション（日数）
 */
export const daysQueryValidation = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('日数は1～365の範囲で入力してください')
];

/**
 * クエリパラメータのバリデーション（期間）
 */
export const periodQueryValidation = [
  query('period')
    .optional()
    .isIn(['7', '30', '90'])
    .withMessage('期間は7、30、90のいずれかを指定してください')
];

/**
 * IDパラメータのバリデーション
 */
export const idParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('IDは正の整数である必要があります')
];

/**
 * 記録数のクエリパラメータバリデーション
 */
export const limitQueryValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('取得件数は1～100の範囲で入力してください')
];