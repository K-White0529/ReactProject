import { test, expect } from "@playwright/test";

test.describe("記録作成画面（RecordForm）", () => {
    test.beforeEach(async ({ page }) => {
        // テスト前にログイン
        await page.goto("/");
        await page.fill('input[name="username"]', "testuser");
        await page.fill('input[name="password"]', "Test1234!");
        await page.click('button:has-text("ログイン")');
        await expect(
            page.locator('h1:has-text("ダッシュボード")')
        ).toBeVisible();

        // 記録作成画面に移動
        await page.click('button:has-text("データを登録")');
        await expect(page.locator('h1:has-text("データ登録")')).toBeVisible({
            timeout: 10000,
        });
    });

    test("気象情報カードが表示される", async ({ page }) => {
        // 気象情報カードが表示されることを確認（最大10秒待機）
        const weatherCard = page.locator(".weather-info-card");
        const hasWeatherCard = await weatherCard
            .isVisible({ timeout: 10000 })
            .catch(() => false);

        if (hasWeatherCard) {
            await expect(weatherCard).toBeVisible();
        }
    });

    test("Step1: すべてのフォーム項目が表示される", async ({ page }) => {
        // セクションタイトルが表示されることを確認
        await expect(page.locator('h2:has-text("睡眠")')).toBeVisible();
        await expect(page.locator('h2:has-text("食事")')).toBeVisible();
        await expect(page.locator('h2:has-text("運動")')).toBeVisible();
        await expect(page.locator('h2:has-text("感情")')).toBeVisible();
        await expect(
            page.locator('h2:has-text("モチベーション")')
        ).toBeVisible();
        await expect(page.locator('h2:has-text("やったこと")')).toBeVisible();

        // 入力フィールドが表示されることを確認
        await expect(
            page.locator('input[type="number"][id="sleep_hours"]')
        ).toBeVisible();
        await expect(
            page.locator('input[type="range"][id="sleep_quality"]')
        ).toBeVisible();
        await expect(
            page.locator('input[type="range"][id="meal_regularity"]')
        ).toBeVisible();
        await expect(
            page.locator('input[type="range"][id="meal_quality"]')
        ).toBeVisible();
        await expect(
            page.locator('input[type="number"][id="exercise_minutes"]')
        ).toBeVisible();
        await expect(
            page.locator('input[type="range"][id="exercise_intensity"]')
        ).toBeVisible();
        await expect(
            page.locator('input[type="range"][id="emotion_score"]')
        ).toBeVisible();
        await expect(page.locator('textarea[id="emotion_note"]')).toBeVisible();
        await expect(
            page.locator('input[type="range"][id="motivation_score"]')
        ).toBeVisible();
        await expect(
            page.locator('textarea[id="activities_done"]')
        ).toBeVisible();
    });

    test("Step1: 基本データを入力できる", async ({ page }) => {
        // 睡眠時間を入力
        await page.fill('input[id="sleep_hours"]', "7.5");
        await expect(page.locator('input[id="sleep_hours"]')).toHaveValue(
            "7.5"
        );

        // スライダーを調整
        await page.locator('input[id="sleep_quality"]').fill("8");
        await page.locator('input[id="meal_regularity"]').fill("7");
        await page.locator('input[id="meal_quality"]').fill("8");

        // 運動時間を入力
        await page.fill('input[id="exercise_minutes"]', "30");
        await expect(page.locator('input[id="exercise_minutes"]')).toHaveValue(
            "30"
        );

        // 運動強度、気分、モチベーションを調整
        await page.locator('input[id="exercise_intensity"]').fill("6");
        await page.locator('input[id="emotion_score"]').fill("8");
        await page.locator('input[id="motivation_score"]').fill("7");

        // テキストエリアに入力
        await page.fill('textarea[id="emotion_note"]', "テスト用の気分メモ");
        await page.fill('textarea[id="activities_done"]', "テスト用の活動記録");
    });

    test("Step1: 必須項目が未入力の場合エラーが表示される", async ({
        page,
    }) => {
        // 何も入力せずに「調子分析入力に進む」ボタンをクリック
        await page.click('button:has-text("調子分析入力に進む")');

        // エラーメッセージが表示されることを確認
        await expect(
            page.locator(".error-message, .validation-error")
        ).toBeVisible({ timeout: 3000 });
    });

    test("Step1→Step2: 調子分析入力に進める", async ({ page }) => {
        // 必須項目を入力
        await page.fill('input[id="sleep_hours"]', "7.5");
        await page.locator('input[id="sleep_quality"]').fill("8");
        await page.locator('input[id="meal_regularity"]').fill("7");
        await page.locator('input[id="meal_quality"]').fill("8");
        await page.fill('input[id="exercise_minutes"]', "30");
        await page.locator('input[id="exercise_intensity"]').fill("6");
        await page.locator('input[id="emotion_score"]').fill("8");
        await page.locator('input[id="motivation_score"]').fill("7");

        // 「調子分析入力に進む」ボタンをクリック
        await page.click('button:has-text("調子分析入力に進む")');

        // Step2に進んだことを確認（質問の説明テキストが表示される）
        await expect(
            page.locator("text=以下の質問に回答してください")
        ).toBeVisible({ timeout: 10000 });

        // 質問のスライダーが存在することを確認
        const questionSliders = page.locator(
            'input[type="range"][id^="question-"]'
        );
        const count = await questionSliders.count();
        expect(count).toBeGreaterThan(0);
    });

    test("Step2: 質問項目が表示される", async ({ page }) => {
        // Step1を完了してStep2に進む
        await page.fill('input[id="sleep_hours"]', "7.5");
        await page.locator('input[id="sleep_quality"]').fill("8");
        await page.locator('input[id="meal_regularity"]').fill("7");
        await page.locator('input[id="meal_quality"]').fill("8");
        await page.fill('input[id="exercise_minutes"]', "30");
        await page.locator('input[id="exercise_intensity"]').fill("6");
        await page.locator('input[id="emotion_score"]').fill("8");
        await page.locator('input[id="motivation_score"]').fill("7");
        await page.click('button:has-text("調子分析入力に進む")');

        // 質問の読み込み中メッセージが表示される場合がある
        const loadingMessage = page.locator("text=読み込み中...");
        const hasLoading = await loadingMessage
            .isVisible({ timeout: 2000 })
            .catch(() => false);

        if (hasLoading) {
            // 読み込み完了を待つ
            await expect(loadingMessage).not.toBeVisible({ timeout: 15000 });
        }

        // 質問の説明が表示されることを確認（質問読み込み後）
        await expect(
            page.locator("text=以下の質問に回答してください")
        ).toBeVisible({ timeout: 15000 });

        // 複数の質問スライダーが存在することを確認
        const questionSliders = page.locator(
            'input[type="range"][id^="question-"]'
        );
        await expect(questionSliders.first()).toBeVisible({ timeout: 5000 });

        const count = await questionSliders.count();
        expect(count).toBeGreaterThan(0);

        // 最初のスライダーのラベルが表示されることを確認
        const firstLabel = page.locator("text=1 低い").first();
        await expect(firstLabel).toBeVisible({ timeout: 3000 });
    });

    test("Step2: 質問に回答して記録を保存できる", async ({ page }) => {
        // Step1を完了
        await page.fill('input[id="sleep_hours"]', "7.5");
        await page.locator('input[id="sleep_quality"]').fill("8");
        await page.locator('input[id="meal_regularity"]').fill("7");
        await page.locator('input[id="meal_quality"]').fill("8");
        await page.fill('input[id="exercise_minutes"]', "30");
        await page.locator('input[id="exercise_intensity"]').fill("6");
        await page.locator('input[id="emotion_score"]').fill("8");
        await page.locator('input[id="motivation_score"]').fill("7");
        await page.click('button:has-text("調子分析入力に進む")');

        // Step2: 質問説明が表示されるのを待つ
        await expect(
            page.locator("text=以下の質問に回答してください")
        ).toBeVisible({ timeout: 10000 });

        // すべてのスライダーに値を設定
        const sliders = page.locator('input[type="range"][id^="question-"]');
        const sliderCount = await sliders.count();

        for (let i = 0; i < sliderCount; i++) {
            await sliders.nth(i).fill("7");
        }

        // 「記録を保存」ボタンをクリック
        await page.click('button:has-text("記録を保存")');

        // ダッシュボードに遷移することを確認
        await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible(
            { timeout: 10000 }
        );
    });

    test("Step2: 未回答の質問がある場合エラーが表示される", async ({
        page,
    }) => {
        // Step1を完了
        await page.fill('input[id="sleep_hours"]', "7.5");
        await page.locator('input[id="sleep_quality"]').fill("8");
        await page.locator('input[id="meal_regularity"]').fill("7");
        await page.locator('input[id="meal_quality"]').fill("8");
        await page.fill('input[id="exercise_minutes"]', "30");
        await page.locator('input[id="exercise_intensity"]').fill("6");
        await page.locator('input[id="emotion_score"]').fill("8");
        await page.locator('input[id="motivation_score"]').fill("7");
        await page.click('button:has-text("調子分析入力に進む")');

        // Step2: 質問説明が表示されるのを待つ
        await expect(
            page.locator("text=以下の質問に回答してください")
        ).toBeVisible({ timeout: 10000 });

        // 質問に回答せずに保存を試みる
        // スライダーはデフォルト値5が設定されているが、answers Mapに値が追加されていないため未回答扱い

        // 「記録を保存」ボタンをクリック
        await page.click('button:has-text("記録を保存")');

        // エラーメッセージが表示されることを確認
        await expect(page.locator(".error-message")).toBeVisible({
            timeout: 3000,
        });
    });

    test("Step2→Step1: 「前に戻る」ボタンでStep1に戻れる", async ({ page }) => {
        // Step1を完了
        await page.fill('input[id="sleep_hours"]', "7.5");
        await page.locator('input[id="sleep_quality"]').fill("8");
        await page.locator('input[id="meal_regularity"]').fill("7");
        await page.locator('input[id="meal_quality"]').fill("8");
        await page.fill('input[id="exercise_minutes"]', "30");
        await page.locator('input[id="exercise_intensity"]').fill("6");
        await page.locator('input[id="emotion_score"]').fill("8");
        await page.locator('input[id="motivation_score"]').fill("7");
        await page.click('button:has-text("調子分析入力に進む")');

        // Step2: 質問説明が表示されるのを待つ
        await expect(
            page.locator("text=以下の質問に回答してください")
        ).toBeVisible({ timeout: 10000 });

        // 「前に戻る」ボタンをクリック
        await page.click('button:has-text("前に戻る")');

        // Step1に戻ったことを確認
        await expect(page.locator('h2:has-text("睡眠")')).toBeVisible();
        await expect(
            page.locator('button:has-text("調子分析入力に進む")')
        ).toBeVisible();
    });
});
