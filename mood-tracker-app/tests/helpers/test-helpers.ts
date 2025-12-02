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
    // 要素が表示されるまで待機
    await page.waitForSelector(selector, { 
        state: 'visible',
        timeout: TIMEOUTS.ELEMENT_VISIBLE 
    });
    
    // クリック
    await page.click(selector, { timeout: TIMEOUTS.ELEMENT_VISIBLE });
    
    // ナビゲーション完了を待機
    await page.waitForLoadState('networkidle');
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
    // 要素が表示されるまで待機
    await page.waitForSelector(selector, { 
        state: 'visible',
        timeout: TIMEOUTS.ELEMENT_VISIBLE 
    });
    
    // クリック
    await page.click(selector, { timeout: TIMEOUTS.ELEMENT_VISIBLE });
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
    
    let selector: string | null = null;
    let lastError: Error | null = null;
    
    // どのセレクターが機能するか試す
    for (const testSelector of selectors) {
        try {
            await page.waitForSelector(testSelector, { 
                state: 'visible',
                timeout: 5000 // 各パターンて5秒
            });
            selector = testSelector;
            break;
        } catch (error) {
            lastError = error as Error;
            continue;
        }
    }
    
    // どのセレクターも機能しなかった場合
    if (!selector) {
        console.error(`Button not found with text: "${buttonText}"`);
        const allButtons = await page.locator('button').allTextContents();
        console.error('Available buttons:', allButtons);
        throw lastError;
    }
    
    console.log(`Using selector: ${selector}`);
    
    // ボタンが有効になるまで待機（最大5秒）
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
        const isDisabled = await page.locator(selector).isDisabled();
        if (!isDisabled) {
            break;
        }
        console.log(`Button is disabled, waiting... (attempt ${attempts + 1}/${maxAttempts})`);
        await page.waitForTimeout(500);
        attempts++;
    }
    
    // クリック
    await page.click(selector, { timeout: TIMEOUTS.ELEMENT_VISIBLE });
    
    // API呼び出しの完了を待機
    await page.waitForLoadState('networkidle');
}

/**
 * ダッシュボードの表示を待つ（複数のセレクタを試行）
 */
async function waitForDashboard(page: Page) {
    // 複数のセレクタを試行（優先度順）
    const selectors = [
        '.dashboard-content',           // ダッシュボードのコンテナ
        'h1.page-title',                // ページタイトル
        '.stats-grid',                  // 統計グリッド
        'h1:has-text("ダッシュボード")',  // h1要素（最後の手段）
    ];
    
    for (const selector of selectors) {
        try {
            await page.waitForSelector(selector, { 
                state: 'visible',
                timeout: TIMEOUTS.NAVIGATION 
            });
            console.log(`Dashboard loaded, detected by: ${selector}`);
            return;
        } catch (error) {
            console.log(`Selector "${selector}" not found, trying next...`);
            continue;
        }
    }
    
    // どのセレクターも見つからなかった場合
    throw new Error('Dashboard did not load within timeout');
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

    // ログイン画面が表示されることを確認
    await expect(page.locator('h1:has-text("ログイン")')).toBeVisible({ 
        timeout: TIMEOUTS.ELEMENT_VISIBLE 
    });

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
    await safeFill(page, 'input[name="username"]', userInfo.username);
    await safeFill(page, 'input[name="email"]', userInfo.email);
    await safeFill(page, 'input[name="password"]', userInfo.password);

    // 登録ボタンをクリック
    await clickAndWait(page, 'button:has-text("登録")');

    // ダッシュボードに遷移することを確認（複数セレクタで試行）
    await waitForDashboard(page);
    
    // 最終確認: h1要素が表示されることを確認
    await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible({
        timeout: TIMEOUTS.ELEMENT_VISIBLE,
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
