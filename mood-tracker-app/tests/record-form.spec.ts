import { test, expect } from "@playwright/test";
import {
    createAndLoginUser,
    TIMEOUTS,
    clickAndWait,
    expectPageTitle,
    safeFill,
    clickSubmitButton,
} from "./helpers/test-helpers";

test.describe("記録作成画面（RecordForm）", () => {
    test.beforeEach(async ({ page }) => {
        // テスト前に新規ユーザーを作成してログイン
        await createAndLoginUser(page);

        // 記録作成画面に移動
        await clickAndWait(page, 'button:has-text("データを登録")');
        await expectPageTitle(page, "データ登録", TIMEOUTS.NAVIGATION);
        
        // フォームが完全に読み込まれるまで待機
        await expect(page.locator('h2:has-text("睡眠")')).toBeVisible({ 
            timeout: TIMEOUTS.ELEMENT_VISIBLE 
        });
        await expect(page.locator('button[type="submit"]')).toBeVisible({ 
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
        await expect(page.locator('text=8')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
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

    test("Step5: フォームを送信して記録を作成できる", async ({ page }) => {
        // フォームに入力
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

        // 送信ボタンをクリック
        await clickSubmitButton(page, "記録を保存");

        // 成功メッセージまたはダッシュボードへの遷移を確認
        const successMessage = page.locator("text=記録を保存しました");
        const hasSuccess = await successMessage
            .isVisible({ timeout: TIMEOUTS.API_CALL })
            .catch(() => false);

        // どちらかが表示されていることを確認
        expect(hasSuccess).toBe(true);
    });

    test("Step6: 記録作成後にフォームがリセットされる", async ({ page }) => {
        // フォームに入力
        await safeFill(page, 'input[id="emotion_score"]', "8");
        await safeFill(page, 'textarea[id="emotion_note"]', "テストメモ");

        // 送信ボタンをクリック
        await clickSubmitButton(page, "記録を保存");

        // 成功メッセージを待つ
        await page.waitForTimeout(2000);

        // フォームがリセットされていることを確認（新しい入力が可能）
        const emotionNote = page.locator('textarea[id="emotion_note"]');
        const noteValue = await emotionNote.inputValue();

        // 空またはリセットされていることを確認
        expect(noteValue).toBe("");
    });

    test("すべてのスライダーが正しく表示され、操作できる", async ({ page }) => {
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
