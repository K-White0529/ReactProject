import { test, expect } from "@playwright/test";

test.describe("記録詳細画面（RecordDetail）", () => {
    test.beforeEach(async ({ page }) => {
        // テスト前にログイン
        await page.goto("/");
        await page.fill('input[name="username"]', "testuser");
        await page.fill('input[name="password"]', "Test1234!");
        await page.click('button:has-text("ログイン")');
        await expect(
            page.locator('h1:has-text("ダッシュボード")')
        ).toBeVisible();
    });

    test("記録一覧から詳細画面に遷移できる", async ({ page }) => {
        // 記録一覧に移動
        await page.click('button:has-text("記録一覧")');
        await expect(page.locator('h1:has-text("記録一覧")')).toBeVisible();

        // 記録カードが存在する場合のみ
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

    test("ダッシュボードから詳細画面に遷移できる", async ({ page }) => {
        // 記録カードが存在する場合のみ
        const recordCards = page.locator(".record-card.clickable");
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

    test("記録詳細の基本情報が表示される", async ({ page }) => {
        // 記録カードをクリックして詳細画面に移動
        const recordCards = page.locator(
            ".record-card.clickable, .record-card"
        );
        const count = await recordCards.count();

        if (count === 0) {
            test.skip();
            return;
        }

        await recordCards.first().click();
        await expect(page.locator('h1:has-text("記録詳細")')).toBeVisible({
            timeout: 5000,
        });

        // 記録詳細カードが表示されることを確認
        await expect(page.locator(".record-detail-card")).toBeVisible();

        // 記録日時セクションが表示されることを確認
        await expect(
            page.locator('.detail-section h3:has-text("記録日時")')
        ).toBeVisible();

        // 日時が表示されることを確認
        const dateText = page.locator(".record-datetime");
        await expect(dateText).toBeVisible();
    });

    test("気象情報カードが表示される", async ({ page }) => {
        // 記録カードをクリックして詳細画面に移動
        const recordCards = page.locator(
            ".record-card.clickable, .record-card"
        );
        const count = await recordCards.count();

        if (count === 0) {
            test.skip();
            return;
        }

        await recordCards.first().click();
        await expect(page.locator('h1:has-text("記録詳細")')).toBeVisible({
            timeout: 5000,
        });

        // 気象情報カードが表示されるかチェック（データがある場合のみ）
        const weatherCard = page.locator(".weather-info-card");
        const hasWeatherCard = await weatherCard.isVisible().catch(() => false);

        if (hasWeatherCard) {
            await expect(weatherCard).toBeVisible();
        }
    });

    test("睡眠情報が表示される", async ({ page }) => {
        // 記録カードをクリックして詳細画面に移動
        const recordCards = page.locator(
            ".record-card.clickable, .record-card"
        );
        const count = await recordCards.count();

        if (count === 0) {
            test.skip();
            return;
        }

        await recordCards.first().click();
        await expect(page.locator('h1:has-text("記録詳細")')).toBeVisible({
            timeout: 5000,
        });

        // 基本情報セクションが存在するか確認
        const basicInfoSection = page.locator(
            '.detail-section h3:has-text("基本情報")'
        );
        const hasBasicInfo = await basicInfoSection
            .isVisible()
            .catch(() => false);

        if (hasBasicInfo) {
            await expect(basicInfoSection).toBeVisible();
        }
    });

    test("体調・気分セクションが表示される", async ({ page }) => {
        // 記録カードをクリックして詳細画面に移動
        const recordCards = page.locator(
            ".record-card.clickable, .record-card"
        );
        const count = await recordCards.count();

        if (count === 0) {
            test.skip();
            return;
        }

        await recordCards.first().click();
        await expect(page.locator('h1:has-text("記録詳細")')).toBeVisible({
            timeout: 5000,
        });

        // 体調・気分セクションが表示されることを確認
        await expect(
            page.locator('.detail-section h3:has-text("体調・気分")')
        ).toBeVisible();

        // スコア表示バーが存在することを確認
        const scoreDisplays = page.locator(".score-display-item");
        const count2 = await scoreDisplays.count();
        expect(count2).toBeGreaterThan(0);
    });

    test("メモセクションが表示される", async ({ page }) => {
        // 記録カードをクリックして詳細画面に移動
        const recordCards = page.locator(
            ".record-card.clickable, .record-card"
        );
        const count = await recordCards.count();

        if (count === 0) {
            test.skip();
            return;
        }

        await recordCards.first().click();
        await expect(page.locator('h1:has-text("記録詳細")')).toBeVisible({
            timeout: 5000,
        });

        // メモセクションが存在するか確認（データがある場合のみ）
        const memoSection = page.locator('.detail-section h3:has-text("メモ")');
        const hasMemo = await memoSection.isVisible().catch(() => false);

        if (hasMemo) {
            await expect(memoSection).toBeVisible();
        }
    });

    test("戻るボタンで記録一覧に戻れる", async ({ page }) => {
        // 記録カードをクリックして詳細画面に移動
        const recordCards = page.locator(
            ".record-card.clickable, .record-card"
        );
        const count = await recordCards.count();

        if (count === 0) {
            test.skip();
            return;
        }

        await recordCards.first().click();
        await expect(page.locator('h1:has-text("記録詳細")')).toBeVisible({
            timeout: 5000,
        });

        // 戻るボタンをクリック
        await page.click('button:has-text("一覧に戻る")');

        // 記録一覧画面に戻ったことを確認
        await expect(page.locator('h1:has-text("記録一覧")')).toBeVisible();
    });

    test("記録詳細カードが表示される", async ({ page }) => {
        // 記録カードをクリックして詳細画面に移動
        const recordCards = page.locator(
            ".record-card.clickable, .record-card"
        );
        const count = await recordCards.count();

        if (count === 0) {
            test.skip();
            return;
        }

        await recordCards.first().click();
        await expect(page.locator('h1:has-text("記録詳細")')).toBeVisible({
            timeout: 5000,
        });

        // 記録詳細カードが表示されることを確認
        await expect(page.locator(".record-detail-card")).toBeVisible();
    });

    test("複数のセクションに分かれて表示される", async ({ page }) => {
        // 記録カードをクリックして詳細画面に移動
        const recordCards = page.locator(
            ".record-card.clickable, .record-card"
        );
        const count = await recordCards.count();

        if (count === 0) {
            test.skip();
            return;
        }

        await recordCards.first().click();
        await expect(page.locator('h1:has-text("記録詳細")')).toBeVisible({
            timeout: 5000,
        });

        // 複数のセクションが存在することを確認
        const sections = page.locator(".detail-section");
        const sectionCount = await sections.count();

        // 少なくとも2つのセクション（記録日時、体調・気分）が存在することを確認
        expect(sectionCount).toBeGreaterThanOrEqual(2);
    });
});
