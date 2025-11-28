import { test, expect } from "@playwright/test";

test.describe("記録一覧画面（RecordList）", () => {
    test.beforeEach(async ({ page }) => {
        // テスト前にログイン
        await page.goto("/");
        await page.fill('input[name="username"]', "testuser");
        await page.fill('input[name="password"]', "Test1234!");
        await page.click('button:has-text("ログイン")');
        await expect(
            page.locator('h1:has-text("ダッシュボード")')
        ).toBeVisible();

        // 記録一覧ページに移動
        await page.click("text=記録一覧");
        await expect(page.locator('h1:has-text("記録一覧")')).toBeVisible();
    });

    test("ページの基本要素が表示される", async ({ page }) => {
        // ページタイトルが表示されることを確認
        await expect(page.locator('h1:has-text("記録一覧")')).toBeVisible();

        // 記録件数が表示されることを確認
        await expect(page.locator("text=全")).toBeVisible();
        await expect(page.locator("text=件")).toBeVisible();
    });

    test("記録がある場合、記録カードが表示される", async ({ page }) => {
        // 記録カードまたは空の状態メッセージのいずれかが表示される
        const recordCards = page.locator(".record-card");
        const emptyState = page.locator("text=まだ記録がありません");

        const hasRecords = (await recordCards.count()) > 0;
        const hasEmptyState = await emptyState.isVisible().catch(() => false);

        // どちらか一方が表示されていることを確認
        expect(hasRecords || hasEmptyState).toBe(true);
    });

    test("記録カードに必要な情報が表示される", async ({ page }) => {
        // 記録カードが存在する場合のみテスト
        const recordCards = page.locator(".record-card");
        const count = await recordCards.count();

        if (count > 0) {
            const firstCard = recordCards.first();

            // 日時が表示されることを確認
            await expect(
                firstCard.locator(".record-date, .record-datetime")
            ).toBeVisible();

            // スコア情報が表示されることを確認（気分、やる気など）
            const scoreItems = firstCard.locator(".score-item, .score-value");
            const scoreCount = await scoreItems.count();
            expect(scoreCount).toBeGreaterThan(0);
        } else {
            test.skip();
        }
    });

    test("記録カードをクリックして詳細画面に遷移できる", async ({ page }) => {
        // 記録カードが存在する場合のみテスト
        const recordCards = page.locator(".record-card");
        const count = await recordCards.count();

        if (count > 0) {
            // 最初の記録カードをクリック
            await recordCards.first().click();

            // 記録詳細画面に遷移することを確認
            await expect(page.locator('h1:has-text("記録詳細")')).toBeVisible({
                timeout: 5000,
            });
        } else {
            test.skip();
        }
    });

    test("記録がない場合、空の状態メッセージが表示される", async ({ page }) => {
        // 記録カードが存在しない場合
        const recordCards = page.locator(".record-card");
        const count = await recordCards.count();

        if (count === 0) {
            // 空の状態メッセージが表示されることを確認
            await expect(
                page.locator("text=まだ記録がありません")
            ).toBeVisible();

            // 記録作成ボタンが表示されることを確認
            const createButton = page
                .locator(
                    'button:has-text("最初の記録を作成"), button:has-text("記録を作成")'
                )
                .first();
            await expect(createButton).toBeVisible();
        } else {
            test.skip();
        }
    });

    test("空の状態から記録作成画面に遷移できる", async ({ page }) => {
        // 記録がない場合
        const recordCards = page.locator(".record-card");
        const count = await recordCards.count();

        if (count === 0) {
            // 記録作成ボタンをクリック
            const createButton = page
                .locator(
                    'button:has-text("最初の記録を作成"), button:has-text("記録を作成")'
                )
                .first();
            await createButton.click();

            // 記録作成画面に遷移することを確認
            await expect(
                page.locator('h1:has-text("データ登録")')
            ).toBeVisible();
        } else {
            test.skip();
        }
    });

    test("複数の記録がグリッド表示される", async ({ page }) => {
        // 記録カードが存在する場合
        const recordCards = page.locator(".record-card");
        const count = await recordCards.count();

        if (count > 1) {
            // 複数の記録カードが表示されることを確認
            expect(count).toBeGreaterThan(1);

            // グリッドレイアウトが適用されていることを確認
            const grid = page.locator(".records-grid");
            await expect(grid).toBeVisible();
        } else {
            test.skip();
        }
    });

    test("サイドバーから一覧画面に戻れる", async ({ page }) => {
        // 他のページに移動
        await page.click("text=ダッシュボード");
        await expect(
            page.locator('h1:has-text("ダッシュボード")')
        ).toBeVisible();

        // 記録一覧に戻る
        await page.click("text=記録一覧");
        await expect(page.locator('h1:has-text("記録一覧")')).toBeVisible();
    });
});
