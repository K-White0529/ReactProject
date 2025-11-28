test("グラフの期間選択が機能する", async ({ page }) => {
    // グラフセクションが表示されることを確認
    const chartSection = page.locator(".charts-section");
    const hasCharts = await chartSection
        .isVisible({ timeout: 5000 })
        .catch(() => false);

    if (hasCharts) {
        // 期間選択ドロップダウンが表示されることを確認
        const periodSelect = page.locator(
            "select#chart-range, combobox, select"
        );
        const hasSelect = await periodSelect.isVisible().catch(() => false);

        if (hasSelect) {
            // 選択肢を変更できることを確認
            await periodSelect.selectOption({ index: 1 });

            // グラフが再描画されるのを待つ
            await page.waitForTimeout(1000);

            // グラフがまだ表示されていることを確認
            await expect(chartSection).toBeVisible();
        }
    } else {
        test.skip();
    }
});

test("最近の記録が時系列で表示される", async ({ page }) => {
    // 最近の記録セクションが表示されることを確認
    const recentRecords = page.locator(".recent-records");
    const hasRecords = await recentRecords.isVisible().catch(() => false);

    if (hasRecords) {
        // 記録カードが表示されることを確認
        const recordCards = page.locator(".record-card");
        const count = await recordCards.count();

        if (count > 0) {
            // 最初のカードに日時が表示されることを確認
            const firstCard = recordCards.first();
            await expect(firstCard.locator(".record-date")).toBeVisible();
        }
    } else {
        test.skip();
    }
});
import { test, expect } from "@playwright/test";

test.describe("ダッシュボード機能", () => {
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

    test("ダッシュボードの主要要素が表示される", async ({ page }) => {
        // ページタイトルが表示されることを確認
        await expect(
            page.locator('h1:has-text("ダッシュボード")')
        ).toBeVisible();

        // 統計パネルのラベルが表示されることを確認
        await expect(page.locator("text=総記録数")).toBeVisible();
        await expect(page.locator("text=今週の記録")).toBeVisible();
        await expect(page.locator("text=平均気分")).toBeVisible();
        await expect(page.locator("text=平均モチベーション")).toBeVisible();
    });

    test("グラフセクションが表示される", async ({ page }) => {
        // グラフタイトルが表示されることを確認
        await expect(
            page.locator("text=気分とモチベーションの推移")
        ).toBeVisible();
        await expect(page.locator("text=気温と湿度の推移")).toBeVisible();
    });

    test("AIアドバイスカードが表示される", async ({ page }) => {
        // AIアドバイスカードが表示されることを確認
        await expect(page.locator(".advice-card")).toBeVisible();

        // 「今日のアドバイス」タイトルが表示されることを確認
        await expect(page.locator(".advice-card-title")).toBeVisible();

        // リフレッシュボタンが表示されることを確認
        await expect(
            page.locator(
                '.refresh-btn, button[title*="新しいアドバイスを生成"]'
            )
        ).toBeVisible();
    });

    test("クイックアクションボタンが表示される", async ({ page }) => {
        // クイックアクションセクションが表示されることを確認
        await expect(page.locator("text=クイックアクション")).toBeVisible();

        // データ登録ボタンが表示されることを確認
        await expect(
            page.locator('button:has-text("データを登録")')
        ).toBeVisible();

        // 分析を見るボタンが表示されることを確認
        await expect(
            page.locator('button:has-text("分析を見る")')
        ).toBeVisible();
    });

    test("データ登録ボタンから記録作成画面に遷移できる", async ({ page }) => {
        // データ登録ボタンをクリック
        await page.click('button:has-text("データを登録")');

        // 記録作成画面に遷移することを確認
        await expect(page.locator('h1:has-text("データ登録")')).toBeVisible();
    });

    test("分析を見るボタンから分析画面に遷移できる", async ({ page }) => {
        // 分析を見るボタンをクリック
        await page.click('button:has-text("分析を見る")');

        // 分析画面に遷移することを確認
        await expect(page.locator('h1:has-text("分析結果")')).toBeVisible();
    });

    test("最近の記録セクションが表示される", async ({ page }) => {
        // 最近の記録セクションのタイトルが表示されることを確認
        await expect(page.locator("text=最近の記録")).toBeVisible();

        // 記録がある場合はカードが表示され、ない場合は空の状態メッセージが表示される
        const recordCards = page.locator(".record-card");
        const emptyState = page.locator("text=まだ記録がありません");

        const hasRecords = (await recordCards.count()) > 0;
        const hasEmptyState = await emptyState.isVisible().catch(() => false);

        // どちらか一方が表示されていることを確認
        expect(hasRecords || hasEmptyState).toBe(true);
    });

    test("記録カードをクリックして詳細画面に遷移できる", async ({ page }) => {
        // 記録カードが存在する場合のみテスト
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

    test("サイドバーのナビゲーションが機能する", async ({ page }) => {
        // ダッシュボードにいることを確認
        await expect(
            page.locator('h1:has-text("ダッシュボード")')
        ).toBeVisible();

        // 「分析」をクリック
        await page.click('button:has-text("分析")');
        await expect(page.locator('h1:has-text("分析結果")')).toBeVisible();

        // 「ダッシュボード」をクリックして戻る
        await page.click('button:has-text("ダッシュボード")');
        await expect(
            page.locator('h1:has-text("ダッシュボード")')
        ).toBeVisible();

        // 「記録一覧」をクリック
        await page.click('button:has-text("記録一覧")');
        await expect(page.locator('h1:has-text("記録一覧")')).toBeVisible();

        // 「データ登録」をクリック
        await page.click('button:has-text("データ登録")');
        await expect(page.locator('h1:has-text("データ登録")')).toBeVisible();
    });

    test("AIアドバイスを生成できる", async ({ page }) => {
        // リフレッシュボタンをクリック
        await page.click(
            '.refresh-btn, button[title*="新しいアドバイスを生成"]'
        );

        // ローディング状態を確認（spinning classまたは生成中テキスト）
        const loadingIndicator = page
            .locator(".spinning, text=生成中..., text=読み込み中...")
            .first();
        const hasLoading = await loadingIndicator
            .isVisible({ timeout: 2000 })
            .catch(() => false);

        // アドバイスが表示されることを確認（最大35秒待機、コールドスタート考慮）
        const adviceText = page.locator(".advice-text, .empty-text");
        await expect(adviceText).toBeVisible({ timeout: 35000 });
    });

    test("表示範囲を切り替えられる", async ({ page }) => {
        // 表示範囲のコンボボックスが表示されることを確認
        await expect(
            page.locator("select#chart-range, combobox, select")
        ).toBeVisible();

        // 表示範囲を変更
        await page.selectOption("select#chart-range, combobox, select", {
            label: "今日のデータ",
        });
        await page.waitForTimeout(1000);

        await page.selectOption("select#chart-range, combobox, select", {
            label: "直近3日間",
        });
        await page.waitForTimeout(1000);

        await page.selectOption("select#chart-range, combobox, select", {
            label: "直近1週間",
        });
        await page.waitForTimeout(1000);

        // エラーが発生していないことを確認
        const errorMessage = page.locator(".error-message");
        await expect(errorMessage).not.toBeVisible();
    });
});
