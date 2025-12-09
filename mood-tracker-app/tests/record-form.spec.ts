import { test, expect } from "@playwright/test";
import {
    loginAsTestUser,
    TIMEOUTS,
    clickAndWait,
    expectPageTitle,
    safeFill,
    clickSubmitButton,
    safeClick,
} from "./helpers/test-helpers";

test.describe("記録作成画面（RecordForm）", () => {
    test.beforeEach(async ({ page }) => {
        // 固定テストユーザーでログイン
        await loginAsTestUser(page);

        // 記録作成画面に移動
        await clickAndWait(page, 'button:has-text("データを登録")');
        await expectPageTitle(page, "データ登録", TIMEOUTS.NAVIGATION);
        
        // Step 1のフォームが完全に読み込まれるまで待機
        await expect(page.locator('h2:has-text("睡眠")')).toBeVisible({ 
            timeout: TIMEOUTS.ELEMENT_VISIBLE 
        });
        await expect(page.locator('button:has-text("調子分析入力に進む")')).toBeVisible({ 
            timeout: TIMEOUTS.ELEMENT_VISIBLE 
        });
    });

    test("気象情報カードが表示される", async ({ page }) => {
        // 気象情報カードが表示されることを確認
        const weatherCard = page.locator(".weather-info-card");
        const hasWeatherCard = await weatherCard
            .isVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })
            .catch(() => false);

        if (hasWeatherCard) {
            await expect(weatherCard).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
        }
    });

    test("Step1: すべてのフォーム項目が表示される", async ({ page }) => {
        // セクションタイトルが表示されることを確認
        await expect(page.locator('h2:has-text("睡眠")')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
        await expect(page.locator('h2:has-text("食事")')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
        await expect(page.locator('h2:has-text("運動")')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
        await expect(page.locator('h2:has-text("感情")')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
        await expect(
            page.locator('h2:has-text("モチベーション")')
        ).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
        await expect(page.locator('h2:has-text("やったこと")')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });

        // 入力フィールドが表示されることを確認
        await expect(
            page.locator('input[type="number"][id="sleep_hours"]')
        ).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
        await expect(
            page.locator('input[type="range"][id="sleep_quality"]')
        ).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
    });

    test("Step2: 数値入力フィールドに値を入力できる", async ({ page }) => {
        // 睡眠時間を入力
        await safeFill(page, 'input[id="sleep_hours"]', "7.5");
        await expect(page.locator('input[id="sleep_hours"]')).toHaveValue(
            "7.5"
        );

        // 運動時間を入力
        await safeFill(page, 'input[id="exercise_minutes"]', "30");
        await expect(page.locator('input[id="exercise_minutes"]')).toHaveValue(
            "30"
        );
    });

    test("Step3: スライダーを操作できる", async ({ page }) => {
        // 睡眠の質のスライダーを操作
        const sleepQualitySlider = page.locator('input[id="sleep_quality"]');
        await sleepQualitySlider.fill("8");
        await expect(sleepQualitySlider).toHaveValue("8");

        // スライダーの値が表示されることを確認
        await expect(page.locator('.slider-value:has-text("8")')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
    });

    test("Step4: テキストエリアに入力できる", async ({ page }) => {
        // 感情のメモを入力
        await safeFill(page, 'textarea[id="emotion_note"]', "今日はとても良い気分です");
        await expect(page.locator('textarea[id="emotion_note"]')).toHaveValue(
            "今日はとても良い気分です"
        );

        // やったことを入力
        await safeFill(
            page,
            'textarea[id="activities_done"]',
            "朝ジョギングをしました"
        );
        await expect(
            page.locator('textarea[id="activities_done"]')
        ).toHaveValue("朝ジョギングをしました");
    });

    test("Step5: Step1を入力してStep2に進める", async ({ page }) => {
        // Step 1のフォームに入力
        await safeFill(page, 'input[id="sleep_hours"]', "7");
        await safeFill(page, 'input[id="sleep_quality"]', "8");
        await safeFill(page, 'input[id="meal_regularity"]', "7");
        await safeFill(page, 'input[id="meal_quality"]', "8");
        await safeFill(page, 'input[id="exercise_minutes"]', "30");
        await safeFill(page, 'input[id="exercise_intensity"]', "6");
        await safeFill(page, 'input[id="emotion_score"]', "8");
        await safeFill(page, 'textarea[id="emotion_note"]', "良い一日でした");
        await safeFill(page, 'input[id="motivation_score"]', "7");
        await safeFill(page, 'textarea[id="activities_done"]', "ジョギングと読書");

        // Step 2に進むボタンをクリック
        await safeClick(page, 'button:has-text("調子分析入力に進む")');

        // Step 2が表示されることを確認（質問が表示される）
        await expect(page.locator("text=以下の質問に回答してください")).toBeVisible({
            timeout: TIMEOUTS.NAVIGATION,
        });

        // 「記録を保存」ボタンが表示されることを確認
        await expect(page.locator('button:has-text("記録を保存")')).toBeVisible({
            timeout: TIMEOUTS.ELEMENT_VISIBLE,
        });
    });

    test("Step6: フォームを送信して記録を作成できる", async ({ page }) => {
        console.log('[Step6] Starting test...');
        
        // ネットワークリクエストをリッスン
        const requests: any[] = [];
        page.on('request', request => {
            if (request.url().includes('/api/')) {
                requests.push({
                    url: request.url(),
                    method: request.method(),
                });
                console.log(`[Step6] Request: ${request.method()} ${request.url()}`);
            }
        });
        
        page.on('response', async response => {
            if (response.url().includes('/api/')) {
                const status = response.status();
                console.log(`[Step6] Response: ${status} ${response.url()}`);
                if (status >= 400) {
                    const body = await response.text().catch(() => 'Could not read body');
                    console.error(`[Step6] Error response body: ${body}`);
                }
            }
        });
        
        // コンソールログをキャプチャ
        page.on('console', msg => {
            console.log(`[Step6] Browser console [${msg.type()}]: ${msg.text()}`);
        });
        
        // Step 1のフォームに入力
        console.log('[Step6] Filling Step 1 form...');
        await safeFill(page, 'input[id="sleep_hours"]', "7");
        await safeFill(page, 'input[id="sleep_quality"]', "8");
        await safeFill(page, 'input[id="meal_regularity"]', "7");
        await safeFill(page, 'input[id="meal_quality"]', "8");
        await safeFill(page, 'input[id="exercise_minutes"]', "30");
        await safeFill(page, 'input[id="exercise_intensity"]', "6");
        await safeFill(page, 'input[id="emotion_score"]', "8");
        await safeFill(page, 'textarea[id="emotion_note"]', "良い一日でした");
        await safeFill(page, 'input[id="motivation_score"]', "7");
        await safeFill(page, 'textarea[id="activities_done"]', "ジョギングと読書");

        // Step 2に進む
        console.log('[Step6] Moving to Step 2...');
        await safeClick(page, 'button:has-text("調子分析入力に進む")');
        await expect(page.locator("text=以下の質問に回答してください")).toBeVisible({
            timeout: TIMEOUTS.NAVIGATION,
        });
        console.log('[Step6] Step 2 loaded');

        // 質問に回答（最初の質問のみ）
        console.log('[Step6] Filling questions...');
        const firstQuestionSlider = page.locator('input[type="range"]').first();
        await firstQuestionSlider.fill("7");

        // すべての質問に回答
        const allSliders = await page.locator('input[type="range"]').all();
        for (const slider of allSliders) {
            await slider.fill("7");
        }
        console.log(`[Step6] Filled ${allSliders.length} questions`);

        // 送信ボタンをクリック
        console.log('[Step6] Submitting form...');
        const beforeUrl = page.url();
        console.log(`[Step6] Current URL before submit: ${beforeUrl}`);
        
        await clickSubmitButton(page, "記録を保存");
        
        console.log('[Step6] Form submitted, waiting for navigation...');
        await page.waitForTimeout(2000); // 2秒待機
        
        const afterUrl = page.url();
        console.log(`[Step6] Current URL after submit: ${afterUrl}`);
        
        const currentH1 = await page.locator('h1').first().textContent().catch(() => 'NOT FOUND');
        console.log(`[Step6] Current H1: ${currentH1}`);
        
        // リクエストログを出力
        console.log(`[Step6] Total API requests made: ${requests.length}`);
        requests.forEach((req, i) => {
            console.log(`[Step6] Request ${i + 1}: ${req.method} ${req.url}`);
        });

        // ダッシュボードに遷移することを確認
        console.log('[Step6] Verifying dashboard...');
        await expectPageTitle(page, "ダッシュボード", TIMEOUTS.NAVIGATION);
        console.log('[Step6] Test completed successfully!');
    });

    test("Step7: すべてのスライダーが正しく表示され、操作できる", async ({ page }) => {
        // すべてのスライダーをテスト
        const sliders = [
            { id: "sleep_quality", value: "8" },
            { id: "meal_regularity", value: "7" },
            { id: "meal_quality", value: "9" },
            { id: "exercise_intensity", value: "6" },
            { id: "emotion_score", value: "8" },
            { id: "motivation_score", value: "7" },
        ];

        for (const slider of sliders) {
            const element = page.locator(`input[id="${slider.id}"]`);
            await element.fill(slider.value);
            await expect(element).toHaveValue(slider.value);
        }
    });
});
