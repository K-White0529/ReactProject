import { test, expect } from "@playwright/test";

test.describe("認証機能", () => {
    test("新規登録ができる", async ({ page }) => {
        await page.goto("/");

        // ログイン画面が表示されることを確認
        await expect(page.locator('h1:has-text("ログイン")')).toBeVisible();

        // 新規登録リンクをクリック
        await page.click('button:has-text("新規登録はこちら")');

        // 新規登録画面に遷移することを確認
        await expect(page.locator('h1:has-text("新規登録")')).toBeVisible();

        // フォームに入力
        const timestamp = Date.now();
        await page.fill('input[name="username"]', `testuser${timestamp}`);
        await page.fill('input[name="email"]', `test${timestamp}@example.com`);
        await page.fill('input[name="password"]', "Test1234!");

        // 新規登録ボタンをクリック
        await page.click('button:has-text("登録")');

        // ダッシュボードに遷移することを確認
        await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible(
            { timeout: 10000 }
        );
    });

    test("ログイン画面と新規登録画面を切り替えられる", async ({ page }) => {
        await page.goto("/");

        // ログイン画面が表示されることを確認
        await expect(page.locator('h1:has-text("ログイン")')).toBeVisible();

        // 新規登録リンクをクリック
        await page.click('button:has-text("新規登録はこちら")');

        // 新規登録画面に遷移
        await expect(page.locator('h1:has-text("新規登録")')).toBeVisible();

        // ログインリンクをクリック
        await page.click('button:has-text("ログインはこちら")');

        // ログイン画面に戻ることを確認
        await expect(page.locator('h1:has-text("ログイン")')).toBeVisible();
    });

    test("既存ユーザーでログインできる", async ({ page }) => {
        await page.goto("/");

        // ログイン画面が表示されることを確認
        await expect(page.locator('h1:has-text("ログイン")')).toBeVisible();

        // 既存のユーザーでログイン（事前に作成しておく必要があります）
        await page.fill('input[name="username"]', "testuser");
        await page.fill('input[name="password"]', "Test1234!");

        // ログインボタンをクリック
        await page.click('button:has-text("ログイン")');

        // ダッシュボードに遷移することを確認
        await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible(
            { timeout: 10000 }
        );
    });

    test("無効な認証情報でログインに失敗する", async ({ page }) => {
        await page.goto("/");

        // 間違ったユーザー名とパスワードでログイン
        await page.fill('input[name="username"]', "wronguser");
        await page.fill('input[name="password"]', "wrongpassword");

        // ログインボタンをクリック
        await page.click('button:has-text("ログイン")');

        // エラーメッセージまたはログイン画面のままであることを確認
        // エラーメッセージが表示されるか、ログイン画面が残っているかをチェック
        await page.waitForTimeout(3000); // APIレスポンスを待つ

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
        await page.goto("/");

        // 新規登録画面に移動
        await page.click('button:has-text("新規登録はこちら")');
        await expect(page.locator('h1:has-text("新規登録")')).toBeVisible();

        // 短いパスワードで入力
        const timestamp = Date.now();
        await page.fill('input[name="username"]', `testuser${timestamp}`);
        await page.fill('input[name="email"]', `test${timestamp}@example.com`);
        await page.fill('input[name="password"]', "123"); // 短すぎるパスワード

        // 新規登録ボタンをクリック
        await page.click('button:has-text("登録")');

        // エラーメッセージが表示されるか、新規登録画面のままであることを確認
        await page.waitForTimeout(2000);

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
        await page.goto("/");

        // ログインフォームが表示されることを確認
        await expect(page.locator('input[name="username"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();

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
