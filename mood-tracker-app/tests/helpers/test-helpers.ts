import { Page, expect } from "@playwright/test";

/**
 * CI環境用の拡張タイムアウト
 */
export const TIMEOUTS = {
    PAGE_LOAD: 20000,      // ページ読み込み: 20秒
    ELEMENT_VISIBLE: 15000, // 要素表示: 15秒
    NAVIGATION: 30000,      // ナビゲーション: 30秒
    API_CALL: 20000,        // API呼び出し: 20秒
    AI_GENERATION: 40000,   // AI生成: 40秒
} as const;

/**
 * ページに安全に移動する
 */
export async function safeGoto(page: Page, url: string) {
    await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: TIMEOUTS.PAGE_LOAD 
    });
    await page.waitForLoadState('domcontentloaded');
}

/**
 * クリック後にナビゲーション完了を待つ
 */
export async function clickAndWait(page: Page, selector: string) {
    await page.click(selector);
    await page.waitForLoadState('networkidle');
}

/**
 * テストユーザーを作成してログインする
 * @returns 作成したユーザーの情報
 */
export async function createAndLoginUser(page: Page): Promise<{
    username: string;
    password: string;
    email: string;
}> {
    await safeGoto(page, "/");

    // 新規登録画面に移動
    await clickAndWait(page, 'button:has-text("新規登録はこちら")');
    await expect(page.locator('h1:has-text("新規登録")')).toBeVisible({ 
        timeout: TIMEOUTS.ELEMENT_VISIBLE 
    });

    // ユーザー情報を作成
    const timestamp = Date.now();
    const userInfo = {
        username: `testuser${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: "Test1234!",
    };

    // フォームに入力
    await page.fill('input[name="username"]', userInfo.username);
    await page.fill('input[name="email"]', userInfo.email);
    await page.fill('input[name="password"]', userInfo.password);

    // 登録ボタンをクリック
    await clickAndWait(page, 'button:has-text("登録")');

    // ダッシュボードに遷移することを確認
    await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible({
        timeout: TIMEOUTS.NAVIGATION,
    });

    return userInfo;
}

/**
 * 既存のユーザーでログインする
 */
export async function loginUser(
    page: Page,
    username: string,
    password: string
) {
    await safeGoto(page, "/");

    // ログイン画面であることを確認
    await expect(page.locator('h1:has-text("ログイン")')).toBeVisible({
        timeout: TIMEOUTS.ELEMENT_VISIBLE,
    });

    // 認証情報を入力
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);

    // ログインボタンをクリック
    await clickAndWait(page, 'button:has-text("ログイン")');

    // ダッシュボードに遷移することを確認
    await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible({
        timeout: TIMEOUTS.NAVIGATION,
    });
}

/**
 * ログアウトする
 */
export async function logout(page: Page) {
    await clickAndWait(page, '.user-menu, button:has-text("ログアウト")');
    
    // ログイン画面に戻ることを確認
    await expect(page.locator('h1:has-text("ログイン")')).toBeVisible({
        timeout: TIMEOUTS.ELEMENT_VISIBLE,
    });
}

/**
 * 指定したページに移動することを確認
 */
export async function expectPageTitle(page: Page, title: string, timeout?: number) {
    await expect(page.locator(`h1:has-text("${title}")`)).toBeVisible({
        timeout: timeout || TIMEOUTS.ELEMENT_VISIBLE,
    });
}

/**
 * サイドバーから指定のページに移動
 */
export async function navigateTo(page: Page, pageName: string, expectedTitle: string) {
    await clickAndWait(page, `button:has-text("${pageName}")`);
    await expectPageTitle(page, expectedTitle);
}
