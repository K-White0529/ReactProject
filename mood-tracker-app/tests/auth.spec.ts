import { test, expect } from "@playwright/test";
import { deleteTestUser } from "./helpers/test-helpers";

test.describe("認証機能", () => {
    test("新規登録ができる", async ({ page }) => {
        await page.goto("/", { waitUntil: 'networkidle' });
        await page.waitForLoadState('domcontentloaded');

        // ログイン画面が表示されることを確認
        await expect(page.locator('h1:has-text("ログイン")')).toBeVisible({ timeout: 15000 });

        // 新規登録リンクをクリック
        await page.click('button:has-text("新規登録はこちら")');
        await page.waitForLoadState('networkidle');

        // 新規登録画面に遷移することを確認
        await expect(page.locator('h1:has-text("新規登録")')).toBeVisible({ timeout: 15000 });

        // フォームに入力
        const timestamp = Date.now();
        const testUsername = `testuser${timestamp}`;
        await page.fill('input[name="username"]', testUsername);
        await page.fill('input[name="email"]', `test${timestamp}@example.com`);
        await page.fill('input[name="password"]', "Test1234!");

        // 新規登録ボタンをクリック
        await page.click('button:has-text("登録")');
        
        // APIレスポンスを待つ
        await page.waitForLoadState('networkidle');

        // ダッシュボードに遷移することを確認
        await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible(
            { timeout: 20000 }
        );

        // テスト後にクリーンアップ
        await deleteTestUser(testUsername);
    });

    test("ログイン画面と新規登録画面を切り替えられる", async ({ page }) => {
        await page.goto("/", { waitUntil: 'networkidle' });
        await page.waitForLoadState('domcontentloaded');

        // ログイン画面が表示されることを確認
        await expect(page.locator('h1:has-text("ログイン")')).toBeVisible({ timeout: 15000 });

        // 新規登録リンクをクリック
        await page.click('button:has-text("新規登録はこちら")');
        await page.waitForLoadState('domcontentloaded');

        // 新規登録画面に遷移
        await expect(page.locator('h1:has-text("新規登録")')).toBeVisible({ timeout: 15000 });

        // ログインリンクをクリック
        await page.click('button:has-text("ログインはこちら")');
        await page.waitForLoadState('domcontentloaded');

        // ログイン画面に戻ることを確認
        await expect(page.locator('h1:has-text("ログイン")')).toBeVisible({ timeout: 15000 });
    });

    test("既存ユーザーでログインできる", async ({ page }) => {
        // まずユーザーを作成
        await page.goto("/", { waitUntil: 'networkidle' });
        await page.waitForLoadState('domcontentloaded');
        
        // 新規登録画面に移動
        await page.click('button:has-text("新規登録はこちら")');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('h1:has-text("新規登録")')).toBeVisible({ timeout: 15000 });
        
        // テストユーザーを登録
        const timestamp = Date.now();
        const testUsername = `testuser${timestamp}`;
        const testPassword = "Test1234!";
        
        await page.fill('input[name="username"]', testUsername);
        await page.fill('input[name="email"]', `test${timestamp}@example.com`);
        await page.fill('input[name="password"]', testPassword);
        await page.click('button:has-text("登録")');
        await page.waitForLoadState('networkidle');
        
        // ダッシュボードに遷移することを確認
        await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible({ timeout: 20000 });
        
        // ログアウト（サイドバーのユーザーメニューをクリック）
        await page.click('.user-menu, button:has-text("ログアウト")');
        await page.waitForLoadState('networkidle');
        
        // ログイン画面が表示されることを確認
        await expect(page.locator('h1:has-text("ログイン")')).toBeVisible({ timeout: 15000 });

        // 作成したユーザーでログイン
        await page.fill('input[name="username"]', testUsername);
        await page.fill('input[name="password"]', testPassword);

        // ログインボタンをクリック
        await page.click('button:has-text("ログイン")');
        
        // APIレスポンスを待つ
        await page.waitForLoadState('networkidle');

        // ダッシュボードに遷移することを確認
        await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible(
            { timeout: 20000 }
        );
    });

    test("無効な認証情報でログインに失敗する", async ({ page }) => {
        await page.goto("/", { waitUntil: 'networkidle' });
        await page.waitForLoadState('domcontentloaded');

        // 間違ったユーザー名とパスワードでログイン
        await page.fill('input[name="username"]', "wronguser");
        await page.fill('input[name="password"]', "wrongpassword");

        // ログインボタンをクリック
        await page.click('button:has-text("ログイン")');

        // APIレスポンスを待つ
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // エラーメッセージ表示を待つ

        const errorMessage = page.locator(".error-message, .auth-error");
        const loginTitle = page.locator('h1:has-text("ログイン")');

        // エラーメッセージが表示されるか、ログイン画面のままであることを確認
        const hasError = await errorMessage.isVisible().catch(() => false);
        const stillOnLogin = await loginTitle.isVisible().catch(() => false);

        // いずれかが真であることを確認（ログインに失敗した証拠）
        expect(hasError || stillOnLogin).toBe(true);

        // ダッシュボードに遷移していないことを確認
        const dashboard = page.locator('h1:has-text("ダッシュボード")');
        const hasDashboard = await dashboard
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        expect(hasDashboard).toBe(false);
    });

    test("パスワードが短すぎる場合に新規登録できない", async ({ page }) => {
        await page.goto("/", { waitUntil: 'networkidle' });
        await page.waitForLoadState('domcontentloaded');

        // 新規登録画面に移動
        await page.click('button:has-text("新規登録はこちら")');
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page.locator('h1:has-text("新規登録")')).toBeVisible({ timeout: 15000 });

        // 短いパスワードで入力
        const timestamp = Date.now();
        await page.fill('input[name="username"]', `testuser${timestamp}`);
        await page.fill('input[name="email"]', `test${timestamp}@example.com`);
        await page.fill('input[name="password"]', "123"); // 短すぎるパスワード

        // 新規登録ボタンをクリック
        await page.click('button:has-text("登録")');

        // エラーメッセージが表示されるまで待つ
        await page.waitForTimeout(3000);

        const errorMessage = page.locator(".error-message, .auth-error");
        const registerTitle = page.locator('h1:has-text("新規登録")');

        const hasError = await errorMessage.isVisible().catch(() => false);
        const stillOnRegister = await registerTitle
            .isVisible()
            .catch(() => false);

        // いずれかが真であることを確認（新規登録に失敗した証拠）
        expect(hasError || stillOnRegister).toBe(true);
    });

    test("フォーム入力が正しく機能する", async ({ page }) => {
        await page.goto("/", { waitUntil: 'networkidle' });
        await page.waitForLoadState('domcontentloaded');

        // ログインフォームが表示されることを確認
        await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('input[name="password"]')).toBeVisible({ timeout: 15000 });

        // 入力フィールドにテキストを入力
        await page.fill('input[name="username"]', "testinput");
        await page.fill('input[name="password"]', "testpassword");

        // 入力した値が保持されることを確認
        await expect(page.locator('input[name="username"]')).toHaveValue(
            "testinput"
        );
        await expect(page.locator('input[name="password"]')).toHaveValue(
            "testpassword"
        );
    });
});
