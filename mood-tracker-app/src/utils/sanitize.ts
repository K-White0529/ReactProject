import DOMPurify from 'dompurify';

/**
 * HTML文字列をサニタイズ
 * XSS攻撃を防ぐため、危険なタグやスクリプトを除去
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
    ALLOWED_ATTR: [],
  });
}

/**
 * プレーンテキストをサニタイズ
 * HTMLタグを完全に除去し、テキストのみを返す
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * 改行を<br>タグに変換してサニタイズ
 * テキストエリアの内容を表示する際に使用
 */
export function sanitizeWithLineBreaks(dirty: string): string {
  const textOnly = sanitizeText(dirty);
  const withBreaks = textOnly.replace(/\n/g, '<br>');
  return withBreaks;
}

/**
 * React用のサニタイズ済みHTMLを作成
 * dangerouslySetInnerHTMLで使用
 */
export function createSafeHtml(dirty: string): { __html: string } {
  return {
    __html: sanitizeHtml(dirty)
  };
}

/**
 * React用のサニタイズ済みテキスト（改行付き）を作成
 */
export function createSafeTextWithBreaks(dirty: string): { __html: string } {
  return {
    __html: sanitizeWithLineBreaks(dirty)
  };
}
