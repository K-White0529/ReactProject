/**
 * カスタムエラークラス
 * 
 * アプリケーション全体で統一されたエラーハンドリングを実現
 */

/**
 * ベースエラークラス
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // スタックトレースの正常化
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * バリデーションエラー（400 Bad Request）
 */
export class ValidationError extends AppError {
  constructor(message: string = 'バリデーションエラーが発生しました') {
    super(message, 400);
  }
}

/**
 * 認証エラー（401 Unauthorized）
 */
export class AuthenticationError extends AppError {
  constructor(message: string = '認証に失敗しました') {
    super(message, 401);
  }
}

/**
 * 認可エラー（403 Forbidden）
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'このリソースへのアクセス権限がありません') {
    super(message, 403);
  }
}

/**
 * リソース未検出エラー（404 Not Found）
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'リソースが見つかりません') {
    super(message, 404);
  }
}

/**
 * 競合エラー（409 Conflict）
 */
export class ConflictError extends AppError {
  constructor(message: string = 'リソースが既に存在します') {
    super(message, 409);
  }
}

/**
 * レート制限エラー（429 Too Many Requests）
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'リクエストが多すぎます') {
    super(message, 429);
  }
}

/**
 * サーバーエラー（500 Internal Server Error）
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'サーバーエラーが発生しました') {
    super(message, 500, false);
  }
}

/**
 * データベースエラー（500 Internal Server Error）
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'データベースエラーが発生しました') {
    super(message, 500, false);
  }
}

/**
 * 外部APIエラー（502 Bad Gateway）
 */
export class ExternalAPIError extends AppError {
  constructor(message: string = '外部APIエラーが発生しました') {
    super(message, 502, false);
  }
}

/**
 * サービス利用不可エラー（503 Service Unavailable）
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'サービスが一時的に利用できません') {
    super(message, 503, false);
  }
}
