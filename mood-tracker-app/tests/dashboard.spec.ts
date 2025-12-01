import { test, expect } from "@playwright/test";
import {
    createAndLoginUser,
    TIMEOUTS,
    clickAndWait,
    expectPageTitle,
    navigateTo,
    safeClick,
} from "./helpers/test-helpers";

test.describe("ダッシュボード機能", () => {
    test.beforeEach(async ({ page }) => {
        // テスト前に新規ユーザーを作成してログイン
        await createAndLoginUser(page);
    });

    test("ダッシュボードの主要要素が表示される", async ({ page }) => {
        // ページタイトルが表示されることを確認
        await expectPageTitle(page, "ダッシュボード");

        // 統計パネルのラベルが表示されることを確認
        await expect(page.locator("text=総記録数")).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
        await expect(page.locator("text=今週の記録")).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
        await expect(page.locator("text=平均気分")).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
        await expect(page.locator("text=平均モチベーション")).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
    });

    test("グラフセクションが表示される", async ({ page }) => {
        // グラフタイトルが表示されることを確認
        await expect(
            page.locator("text=気分とモチベーションの推移")
        ).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
        await expect(page.locator("text=気温と湿度の推移")).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
    });

    test("AIアドバイスカードが表示される", async ({ page }) => {
        // AIアドバイスカードが表示されることを確認
        await expect(page.locator(".advice-card")).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });

        // 「今日のアドバイス」タイトルが表示されることを確認
        await expect(page.locator(".advice-card-title")).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });

        // リフレッシュボタンが表示されることを確認
        await expect(
            page.locator(
                '.refresh-btn, button[title*="新しいアドバイスを生成"]'
            )
        ).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
    });

    test("クイックアクションボタンが表示される", async ({ page }) => {
        // クイックアクションセクションが表示されることを確認
        await expect(page.locator("text=クイックアクション")).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });

        // データ登録ボタンが表示されることを確認
        await expect(
            page.locator('button:has-text("データを登録")')
        ).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });

        // 分析を見るボタンが表示されることを確認
        await expect(
            page.locator('button:has-text("分析を見る"), button:has-text("自己分析を行う")')
        ).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
    });

    test("データ登録ボタンから記録作成画面に遷移できる", async ({ page }) => {
        // データ登録ボタンをクリック
        await clickAndWait(page, 'button:has-text("データを登録")');

        // 記録作成画面に遷移することを確認
        await expectPageTitle(page, "データ登録");
    });

    test("分析を見るボタンから分析画面に遷移できる", async ({ page }) => {
        // 分析を見るボタンをクリック
        await clickAndWait(page, 'button:has-text("分析を見る"), button:has-text("自己分析を行う")');

        // 分析画面に遷移することを確認
        await expectPageTitle(page, "分析結果", TIMEOUTS.NAVIGATION);
    });

    test("最近の記録セクションが表示される", async ({ page }) => {
        // 最近の記録セクションのタイトルが表示されることを確認
        await expect(page.locator("text=最近の記録")).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });

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
            await clickAndWait(page, ".record-card.clickable >> nth=0");

            // 記録詳細画面に遷移することを確認
            await expectPageTitle(page, "記録詳細", TIMEOUTS.NAVIGATION);
        } else {
            test.skip();
        }
    });

    test("サイドバーのナビゲーションが機能する", async ({ page }) => {
        // ダッシュボードにいることを確認
        await expectPageTitle(page, "ダッシュボード");

        // 「分析」をクリック
        await navigateTo(page, "分析", "分析結果");

        // 「ダッシュボード」をクリックして戻る
        await navigateTo(page, "ダッシュボード", "ダッシュボード");

        // 「記録一覧」をクリック
        await navigateTo(page, "記録一覧", "記録一覧");

        // 「データ登録」をクリック
        await navigateTo(page, "データ登録", "データ登録");
    });

    test("AIアドバイスを生成できる", async ({ page }) => {
        // リフレッシュボタンをクリック
        await safeClick(
            page,
            '.refresh-btn, button[title*="新しいアドバイスを生成"]'
        );

        // ローディング状態を確認（spinning classまたは生成中テキスト）
        const loadingIndicator = page
            .locator(".spinning, text=生成中..., text=読み込み中...")
            .first();
        const hasLoading = await loadingIndicator
            .isVisible({ timeout: 2000 })
            .catch(() => false);

        // アドバイスが表示されることを確認（最大40秒待機、コールドスタート考慮）
        const adviceText = page.locator(".advice-text, .empty-text");
        await expect(adviceText).toBeVisible({ timeout: TIMEOUTS.AI_GENERATION });
    });

    test("表示範囲を切り替えられる", async ({ page }) => {
        // 表示範囲のコンボボックスが表示されることを確認
        await expect(
            page.locator("select#chart-range, combobox, select")
        ).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });

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

    test("グラフの期間選択が機能する", async ({ page }) => {
        // グラフセクションが表示されることを確認
        const chartSection = page.locator(".charts-section");
        const hasCharts = await chartSection
            .isVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })
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
                await expect(chartSection).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
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
                await expect(firstCard.locator(".record-date")).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
            }
        } else {
            test.skip();
        }
    });
});
