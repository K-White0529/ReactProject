/**
 * ページネーションユーティリティ
 * 
 * オフセットベースのページネーションとレスポンスフォーマット機能
 */

/**
 * ページネーションパラメータの型
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * ページネーション結果の型
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * ページネーションパラメータを解析
 */
export function parsePaginationParams(query: any): {
  limit: number;
  offset: number;
  page: number;
} {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20));
  const offset = (page - 1) * limit;

  return { limit, offset, page };
}

/**
 * ページネーション付きレスポンスを作成
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

/**
 * カーソルベースページネーションパラメータの型
 */
export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

/**
 * カーソルベースページネーション結果の型
 */
export interface CursorPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

/**
 * カーソルベースページネーションパラメータを解析
 */
export function parseCursorPaginationParams(query: any): {
  cursor: string | null;
  limit: number;
} {
  const cursor = query.cursor as string || null;
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20));

  return { cursor, limit };
}

/**
 * カーソルベースページネーション付きレスポンスを作成
 */
export function createCursorPaginatedResponse<T extends { id: number }>(
  data: T[],
  limit: number
): CursorPaginatedResponse<T> {
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore && items.length > 0 
    ? items[items.length - 1].id.toString() 
    : null;

  return {
    success: true,
    data: items,
    pagination: {
      nextCursor,
      hasMore,
      limit
    }
  };
}

/**
 * レスポンスフィールドフィルター
 * 
 * クエリパラメータ'fields'で指定されたフィールドのみを返す
 */
export function filterFields<T extends object>(
  items: T[],
  fields?: string
): Partial<T>[] {
  if (!fields) {
    return items;
  }

  const fieldList = fields.split(',').map(f => f.trim());

  return items.map(item => {
    const filtered: any = {};
    fieldList.forEach(field => {
      if (field in item) {
        filtered[field] = item[field as keyof T];
      }
    });
    return filtered;
  });
}

/**
 * ソートパラメータの型
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * ソートパラメータを解析
 */
export function parseSortParams(query: any): SortParams {
  const sortBy = query.sortBy as string;
  const sortOrder = (query.sortOrder as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

  return { sortBy, sortOrder };
}
