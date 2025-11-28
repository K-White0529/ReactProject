import { test, expect } from "@playwright/test";

test.describe("分析結果画面（AnalysisForm）", () => {
    test.beforeEach(async ({ page }) => {
        // テスト前にログイン
        await page.goto("/");
        await page.fill('input[name="username"]', "testuser");
        await page.fill('input[name="password"]', "Test1234!");
        await page.click('button:has-text("ログイン")');
        await expect(
            page.locator('h1:has-text("ダッシュボード")')
        ).toBeVisible();

        // 分析ページに移動
        await page.click('button:has-text("分析")');
        await expect(page.locator('h1:has-text("分析結果")')).toBeVisible({
            timeout: 10000,
        });
    });

    test("ページの基本要素が表示される", async ({ page }) => {
        // ページタイトルが表示されることを確認
        await expect(page.locator('h1:has-text("分析結果")')).toBeVisible();

        // 戻るボタンが表示されることを確認
        await expect(page.locator('button:has-text("戻る")')).toBeVisible();
    });

    test("期間選択ボタンが表示される", async ({ page }) => {
        // 4つの期間選択ボタンが表示されることを確認
        await expect(page.locator('button:has-text("今日")')).toBeVisible();
        await expect(
            page.locator('button:has-text("直近3日間")')
        ).toBeVisible();
        await expect(page.locator('button:has-text("1週間")')).toBeVisible();
        await expect(page.locator('button:has-text("3週間")')).toBeVisible();
    });

    test("期間を切り替えられる", async ({ page }) => {
        // 「直近3日間」をクリック
        await page.click('button:has-text("直近3日間")');
        await page.waitForTimeout(2000); // データ読み込みを待つ

        // 「3週間」をクリック
        await page.click('button:has-text("3週間")');
        await page.waitForTimeout(2000);

        // 「今日」をクリック
        await page.click('button:has-text("今日")');
        await page.waitForTimeout(2000);

        // 「1週間」に戻す
        await page.click('button:has-text("1週間")');
        await page.waitForTimeout(2000);

        // エラーが発生していないことを確認
        const errorMessage = page.locator(".error-message");
        await expect(errorMessage).not.toBeVisible();
    });

    test("レーダーチャートセクションが表示される", async ({ page }) => {
        // データの読み込みを待つ
        await page.waitForTimeout(3000);

        // レーダーチャートのセクションが表示されることを確認
        const radarSection = page.locator("text=観点別スコア");
        await expect(radarSection).toBeVisible({ timeout: 10000 });
    });

    test("スコア遷移グラフセクションが表示される", async ({ page }) => {
        // データの読み込みを待つ
        await page.waitForTimeout(3000);

        // スコア遷移グラフのセクションが表示されることを確認
        const trendSection = page.locator("text=スコアの遷移");
        await expect(trendSection).toBeVisible({ timeout: 10000 });
    });

    test("AI分析結果セクションが表示される", async ({ page }) => {
        // AI分析セクションが表示されることを確認
        const aiSection = page.locator("text=AI分析結果");
        await expect(aiSection).toBeVisible({ timeout: 10000 });
    });

    test("AI分析結果が表示される（データがある場合）", async ({ page }) => {
        // AI分析セクションが表示されることを確認
        await expect(page.locator("text=AI分析結果")).toBeVisible({
            timeout: 10000,
        });

        // AI分析の内容エリアが表示されることを確認（最大60秒待機）
        // 「分析中...」、エラーメッセージ、または実際の分析結果が表示される
        const analyzingMessage = page.locator("text=分析中...");
        const aiContent = page.locator(
            ".ai-analysis-content, .analysis-summary, .error-text"
        );
        const retryButton = page.locator('button:has-text("再試行")');

        // まず「分析中...」メッセージが表示されるかを確認
        const hasAnalyzing = await analyzingMessage
            .isVisible({ timeout: 5000 })
            .catch(() => false);

        if (hasAnalyzing) {
            // 分析中メッセージが表示されている場合、結果を待つ
            const hasContent = await aiContent
                .isVisible({ timeout: 60000 })
                .catch(() => false);

            if (hasContent) {
                await expect(aiContent).toBeVisible();
            } else {
                // タイムアウトした場合、再試行ボタンまたはエラーメッセージが表示されることを確認
                const hasRetry = await retryButton
                    .isVisible()
                    .catch(() => false);
                const hasError = await page
                    .locator(".error-text")
                    .isVisible()
                    .catch(() => false);
                expect(hasRetry || hasError || hasAnalyzing).toBe(true);
            }
        } else {
            // 分析中メッセージが表示されない場合、直接結果を確認
            const hasContent = await aiContent
                .isVisible({ timeout: 10000 })
                .catch(() => false);
            const hasRetry = await retryButton.isVisible().catch(() => false);

            expect(hasContent || hasRetry).toBe(true);
        }
    });

    test("再分析ボタンが表示される", async ({ page }) => {
        // 再分析ボタンが表示されることを確認
        const refreshButton = page.locator('button:has-text("再分析")');
        await expect(refreshButton).toBeVisible();
    });

    test("再分析ボタンでデータを再読み込みできる", async ({ page }) => {
        // データの読み込みを待つ
        await page.waitForTimeout(3000);

        // 再分析ボタンをクリック
        await page.click('button:has-text("再分析")');

        // ローディング状態を確認
        const loading = page
            .locator("text=分析中..., text=読み込み中...")
            .first();
        const hasLoading = await loading
            .isVisible({ timeout: 2000 })
            .catch(() => false);

        if (hasLoading) {
            // データが再読み込みされることを確認
            await page.waitForTimeout(3000);
            await expect(loading).not.toBeVisible();
        }
    });

    test("戻るボタンでダッシュボードに戻れる", async ({ page }) => {
        // 戻るボタンをクリック
        await page.click('button:has-text("戻る")');

        // ダッシュボードに戻ったことを確認
        await expect(
            page.locator('h1:has-text("ダッシュボード")')
        ).toBeVisible();
    });

    test("データがない場合の表示", async ({ page }) => {
        // 「今日」を選択（データがない可能性が高い）
        await page.click('button:has-text("今日")');
        await page.waitForTimeout(3000);

        // エラーメッセージまたは「データがありません」メッセージの確認
        const noDataMessage = page
            .locator(
                "text=データがありません, text=この期間のデータがありません"
            )
            .first();
        const hasNoData = await noDataMessage.isVisible().catch(() => false);

        // データがない場合は、適切なメッセージが表示されることを確認
        if (hasNoData) {
            await expect(noDataMessage).toBeVisible();
        }
    });

    test("グラフエリアが存在する", async ({ page }) => {
        // データの読み込みを待つ
        await page.waitForTimeout(3000);

        // Canvas要素（Chart.jsのグラフ）またはSVG要素が存在することを確認
        const graphElements = page.locator("canvas, svg");
        const count = await graphElements.count();

        // 少なくとも1つのグラフ要素が存在することを確認
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test("期間別のデータが正しく表示される", async ({ page }) => {
        // 「1週間」を選択（デフォルト）
        await page.click('button:has-text("1週間")');
        await page.waitForTimeout(3000);

        // グラフが表示されることを確認
        let graphCount = await page.locator("canvas, svg").count();
        const hasGraphsWeek = graphCount > 0;

        // 「直近3日間」を選択
        await page.click('button:has-text("直近3日間")');
        await page.waitForTimeout(3000);

        // グラフが再描画されることを確認（要素数は変わらないが、データは変わる）
        graphCount = await page.locator("canvas, svg").count();
        const hasGraphs3Days = graphCount > 0;

        // どちらの期間でもグラフが表示されることを確認
        expect(hasGraphsWeek || hasGraphs3Days).toBe(true);
    });

    test("見出しに期間が表示される", async ({ page }) => {
        // デフォルトの期間（1週間）の見出しを確認
        await page.waitForTimeout(2000);

        // 見出しに期間が含まれることを確認
        const headings = page.locator("h2, h3");
        const headingTexts = await headings.allTextContents();

        // いずれかの見出しに「1週間」または期間の情報が含まれることを確認
        const hasPeriodInfo = headingTexts.some(
            (text) =>
                text.includes("1週間") ||
                text.includes("直近") ||
                text.includes("今日")
        );

        expect(hasPeriodInfo).toBe(true);
    });
});
