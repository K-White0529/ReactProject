/**
 * エラーハンドリングミドルウェア
 * 
 * アプリケーション全体の統一されたエラーレスポンスを提供
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

/**
 * エラーレスポンスの型
 */
interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  stack?: string;
  statusCode?: number;
}

/**
 * グローバルエラーハンドラー
 */
export function globalErrorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // デフォルトのステータスコードとメッセージ
  let statusCode = 500;
  let message = 'サーバーエラーが発生しました';
  let isOperational = false;

  // AppErrorの場合
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // エラーログ出力
  console.error('[Error]', {
    message: err.message,
    statusCode,
    isOperational,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // レスポンス作成
  const errorResponse: ErrorResponse = {
    success: false,
    message: isOperational ? message : 'サーバーエラーが発生しました',
  };

  // 開発環境では詳細情報を含める
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = err.message;
    errorResponse.stack = err.stack;
    errorResponse.statusCode = statusCode;
  }

  // レスポンス送信
  res.status(statusCode).json(errorResponse);
}

/**
 * 404エラーハンドラー
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    success: false,
    message: 'エンドポイントが見つかりません',
    path: req.url
  });
}

/**
 * 非同期エラーキャッチャー
 * Promise拒否を適切にキャッチする
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * バリデーションエラーのフォーマット
 */
export function formatValidationErrors(errors: any[]): string {
  return errors
    .map(err => `${err.param}: ${err.msg}`)
    .join(', ');
}
