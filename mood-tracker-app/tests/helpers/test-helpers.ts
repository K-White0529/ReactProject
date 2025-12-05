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
 * クリック後にナビゲーション完了を待つ（コード分割対応版 - 改善版）
 */
export async function clickAndWait(page: Page, selector: string) {
    // クリック前の状態を記録
    const beforeUrl = page.url();
    const beforeH1 = await page.locator('h1').first().textContent().catch(() => '');

    console.log(`[clickAndWait] Before click - URL: ${beforeUrl}, H1: ${beforeH1}`);
    console.log(`[clickAndWait] Clicking selector: ${selector}`);

    // Playwright推奨の方法でクリック（auto-waiting付き）
    await page.locator(selector).first().click({ timeout: TIMEOUTS.ELEMENT_VISIBLE });

    console.log(`[clickAndWait] Click executed`);

    // ナビゲーション完了を待機
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        console.log('[clickAndWait] networkidle timeout, continuing...');
    });

    // コード分割のためのローディングスピナーが消えるのを待つ
    const loadingSpinner = page.locator('.loading-spinner');
    if (await loadingSpinner.isVisible().catch(() => false)) {
        await loadingSpinner.waitFor({
            state: 'hidden',
            timeout: 5000
        }).catch(() => {
            console.log('[clickAndWait] loading spinner timeout, continuing...');
        });
    }

    // URLまたはh1が変化するまでポーリング（SPAナビゲーション検知）
    const startTime = Date.now();
    const pollInterval = 500;
    const maxWaitTime = 10000; // 10秒間ポーリング

    let navigationDetected = false;

    while (Date.now() - startTime < maxWaitTime) {
        const currentUrl = page.url();
        const currentH1 = await page.locator('h1').first().textContent().catch(() => '');

        if (currentUrl !== beforeUrl || currentH1 !== beforeH1) {
            console.log(`[clickAndWait] Navigation detected - URL: ${currentUrl}, H1: ${currentH1}`);
            navigationDetected = true;
            break;
        }

        await page.waitForTimeout(pollInterval);
    }

    if (!navigationDetected) {
        const currentUrl = page.url();
        const currentH1 = await page.locator('h1').first().textContent().catch(() => '');
        console.warn(`[clickAndWait] WARNING: No navigation detected after ${maxWaitTime}ms`);
        console.warn(`[clickAndWait] Before - URL: ${beforeUrl}, H1: ${beforeH1}`);
        console.warn(`[clickAndWait] After  - URL: ${currentUrl}, H1: ${currentH1}`);
    }

    // ナビゲーションが発生した場合、コンポーネントマウント待機
    if (navigationDetected) {
        await page.waitForTimeout(2000);
    }
}

/**
 * 安全に入力フィールドに値を入力
 */
export async function safeFill(page: Page, selector: string, value: string) {
    // 要素が表示されるまで待機
    await page.waitForSelector(selector, {
        state: 'visible',
        timeout: TIMEOUTS.ELEMENT_VISIBLE
    });

    // 入力
    await page.fill(selector, value);
}

/**
 * 安全にクリック（ナビゲーションを伴わない）
 */
export async function safeClick(page: Page, selector: string) {
    // Playwright推奨の方法でクリック
    await page.locator(selector).first().click({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
}

/**
 * ボタンが有効になるまで待ってからクリック（submitボタン用）
 */
export async function clickSubmitButton(page: Page, buttonText: string) {
    // 複数のセレクターパターンを試行（type属性に依存しない順序）
    const selectors = [
        `button:has-text("${buttonText}")`,
        `button:text("${buttonText}")`,
        `button[type="submit"]:has-text("${buttonText}")`
    ];

    let locator = null;
    let lastError: Error | null = null;

    // どのセレクターが機能するか試す
    for (const selector of selectors) {
        try {
            const testLocator = page.locator(selector).first();
            await testLocator.waitFor({
                state: 'visible',
                timeout: 5000 // 各パターンて5秒
            });
            locator = testLocator;
            console.log(`Using selector: ${selector}`);
            break;
        } catch (error) {
            lastError = error as Error;
            continue;
        }
    }

    // どのセレクターも機能しなかった場合
    if (!locator) {
        console.error(`Button not found with text: "${buttonText}"`);
        const allButtons = await page.locator('button').allTextContents();
        console.error('Available buttons:', allButtons);
        throw lastError;
    }

    // ボタンが有効になるまで待機（最大5秒）
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
        const isDisabled = await locator.isDisabled();
        if (!isDisabled) {
            break;
        }
        console.log(`Button is disabled, waiting... (attempt ${attempts + 1}/${maxAttempts})`);
        await page.waitForTimeout(500);
        attempts++;
    }

    // クリック
    await locator.click({ timeout: TIMEOUTS.ELEMENT_VISIBLE });

    // API呼び出しの完了を待機
    await page.waitForLoadState('networkidle');
}

/**
 * テストユーザーを作成してログインする（コード分割対応版）
 * @returns 作成したユーザーの情報
 */
export async function createAndLoginUser(page: Page): Promise<{
    username: string;
    password: string;
    email: string;
}> {
    await safeGoto(page, "/");

    // ローディングスピナーが消えるまで待つ
    await page.waitForSelector('.loading-spinner', { state: 'hidden', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    // ログイン画面が表示されることを確認
    await expect(page.locator('h1:has-text("ログイン")')).toBeVisible({
        timeout: TIMEOUTS.ELEMENT_VISIBLE
    });

    // 新規登録画面に移動
    await clickAndWait(page, 'button:has-text("新規登録はこちら")');

    // ローディング完了を待つ
    await page.waitForTimeout(500);

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

    // 既存ユーザーがいる場合は削除（重複エラー回避）
    await deleteTestUser(userInfo.username).catch(() => {
        console.log(`[createAndLoginUser] No existing user to delete: ${userInfo.username}`);
    });

    // フォームに入力
    await safeFill(page, 'input[name="username"]', userInfo.username);
    await safeFill(page, 'input[name="email"]', userInfo.email);
    await safeFill(page, 'input[name="password"]', userInfo.password);

    // 登録ボタンをクリック
    await clickAndWait(page, 'button:has-text("登録")');

    // ローディングスピナーが消えるのを待つ
    await page.waitForSelector('.loading-spinner', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000); // コンポーネントのマウント待ち

    // ダッシュボードに遷移することを確認
    await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible({
        timeout: TIMEOUTS.ELEMENT_VISIBLE,
    });

    return userInfo;
}

/**
 * 固定テストユーザーでログインする（コード分割対応版）
 * ※ 事前にマイグレーションSQL（007_create_test_user.sql）を実行しておく必要があります
 */
export async function loginAsTestUser(page: Page): Promise<void> {
    await safeGoto(page, "/");

    // ローディングスピナーが消えるまで待つ
    await page.waitForSelector('.loading-spinner', { state: 'hidden', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    // ログイン画面が表示されることを確認
    await expect(page.locator('h1:has-text("ログイン")')).toBeVisible({
        timeout: TIMEOUTS.ELEMENT_VISIBLE
    });

    // 固定テストユーザーでログイン
    await safeFill(page, 'input[name="username"]', 'test_user');
    await safeFill(page, 'input[name="password"]', 'Test1234!');

    // ログインボタンをクリック
    await clickAndWait(page, 'button:has-text("ログイン")');

    // ローディングスピナーが消えるのを待つ
    await page.waitForSelector('.loading-spinner', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000); // コンポーネントのマウント待ち

    // ダッシュボードに遷移することを確認
    await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible({
        timeout: TIMEOUTS.NAVIGATION,
    });
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
    await safeFill(page, 'input[name="username"]', username);
    await safeFill(page, 'input[name="password"]', password);

    // ログインボタンをクリック
    await clickAndWait(page, 'button:has-text("ログイン")');

    // ダッシュボードに遷移することを確認（複数セレクタで試行）
    await waitForDashboard(page);

    // 最終確認: h1要素が表示されることを確認
    await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible({
        timeout: TIMEOUTS.ELEMENT_VISIBLE,
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
 * 指定したページに移動することを確認（コード分割対応版 - ポーリングベース）
 */
export async function expectPageTitle(page: Page, title: string, timeout?: number) {
    const actualTimeout = timeout || TIMEOUTS.ELEMENT_VISIBLE;

    console.log(`[expectPageTitle] Expecting title: "${title}"`);

    // ローディングスピナーが表示されている場合は消えるまで待つ
    const loadingSpinner = page.locator('.loading-spinner');
    if (await loadingSpinner.isVisible().catch(() => false)) {
        console.log('[expectPageTitle] Waiting for loading spinner to disappear...');
        await loadingSpinner.waitFor({
            state: 'hidden',
            timeout: 5000
        }).catch(() => {
            console.log('[expectPageTitle] Loading spinner timeout');
        });
    }

    // 初期待機（コンポーネントマウント開始）
    await page.waitForTimeout(1000);

    // h1要素のテキストが期待値になるまでポーリング（最も確実な方法）
    const startTime = Date.now();
    const pollInterval = 500; // 500msごとにチェック
    let attemptCount = 0;

    while (Date.now() - startTime < actualTimeout) {
        attemptCount++;
        const h1Text = await page.locator('h1').first().textContent({ timeout: 1000 }).catch(() => '');

        if (attemptCount <= 3 || attemptCount % 10 === 0) {
            console.log(`[expectPageTitle] Attempt ${attemptCount}: Current h1 = "${h1Text?.trim()}"`);
        }

        if (h1Text?.trim() === title) {
            // 成功：期待値と一致
            console.log(`[expectPageTitle] SUCCESS: Title matched after ${Date.now() - startTime}ms`);
            // さらに500ms待機してDOMが安定することを確認
            await page.waitForTimeout(500);
            return;
        }

        // まだ一致しない場合は、次のポーリングまで待機
        await page.waitForTimeout(pollInterval);
    }

    // タイムアウト：最終確認してエラーを投げる
    const finalH1Text = await page.locator('h1').first().textContent({ timeout: 1000 }).catch(() => '');
    console.error(`[expectPageTitle] TIMEOUT: Expected "${title}" but got "${finalH1Text?.trim()}" after ${actualTimeout}ms`);
    console.error(`[expectPageTitle] Total attempts: ${attemptCount}`);
    throw new Error(`Expected h1 to be "${title}" but got "${finalH1Text?.trim()}" after ${actualTimeout}ms timeout`);
}

/**
 * サイドバーから指定のページに移動
 */
export async function navigateTo(page: Page, pageName: string, expectedTitle: string) {
    await clickAndWait(page, `button:has-text("${pageName}")`);
    await expectPageTitle(page, expectedTitle);
}

/**
 * テストユーザーを削除（クリーンアップ用）
 */
export async function deleteTestUser(username: string): Promise<void> {
    try {
        const apiUrl = process.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/auth/test-user/${username}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            console.log(`[deleteTestUser] Successfully deleted user: ${username}`);
            // 削除後、データベース制約チェックが完了するまで少し待機
            await new Promise(resolve => setTimeout(resolve, 500));
        } else if (response.status === 404) {
            console.log(`[deleteTestUser] User not found: ${username}`);
        } else {
            console.warn(`[deleteTestUser] Failed to delete user: ${username}`, response.status);
        }
    } catch (error) {
        console.warn('[deleteTestUser] Error deleting test user:', error);
        // エラーでもテストを続行
    }
}
