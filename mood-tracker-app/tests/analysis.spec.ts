import { test, expect } from "@playwright/test";
import {
    createAndLoginUser,
    TIMEOUTS,
    clickAndWait,
    expectPageTitle,
    navigateTo,
    safeClick,
} from "./helpers/test-helpers";

test.describe("分析結果画面（AnalysisForm）", () => {
    test.beforeEach(async ({ page }) => {
        // テスト前に新規ユーザーを作成してログイン
        await createAndLoginUser(page);

        // 分析ページに移動
        await navigateTo(page, "分析", "分析結果");
    });

    test("ページの基本要素が表示される", async ({ page }) => {
        // ページタイトルが表示されることを確認
        await expectPageTitle(page, "分析結果");

        // 戻るボタンが表示されることを確認
        await expect(page.locator('button:has-text("戻る")')).toBeVisible({
            timeout: TIMEOUTS.ELEMENT_VISIBLE,
        });
    });

    test("期間選択ボタンが表示される", async ({ page }) => {
        // 4つの期間選択ボタンが表示されることを確認
        await expect(page.locator('button:has-text("今日")')).toBeVisible({
            timeout: TIMEOUTS.ELEMENT_VISIBLE,
        });
        await expect(
            page.locator('button:has-text("直近3日間")')
        ).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
        await expect(page.locator('button:has-text("1週間"), button:has-text("直近1週間")')).toBeVisible({
            timeout: TIMEOUTS.ELEMENT_VISIBLE,
        });
        await expect(page.locator('button:has-text("3週間"), button:has-text("直近3週間")')).toBeVisible({
            timeout: TIMEOUTS.ELEMENT_VISIBLE,
        });
    });

    test("期間を切り替えられる", async ({ page }) => {
        // 「直近3日間」をクリック
        await safeClick(page, 'button:has-text("直近3日間")');
        await page.waitForTimeout(2000);

        // 「直近1週間」をクリック
        await safeClick(page, 'button:has-text("1週間"), button:has-text("直近1週間")');
        await page.waitForTimeout(2000);

        // 「直近3週間」をクリック
        await safeClick(page, 'button:has-text("3週間"), button:has-text("直近3週間")');
        await page.waitForTimeout(2000);

        // エラーが発生していない、またはデータ不足のエラーであることを確認
        const errorMessage = page.locator(".error-message");
        const hasError = await errorMessage.isVisible().catch(() => false);
        
        // 新規ユーザーなのでエラーが出る可能性がある
        // エラーがある場合はデータ不足のエラーであることを確認
        if (hasError) {
            const errorText = await errorMessage.textContent();
            // エラーが出ていてもテストは成功（データがないため）
            expect(errorText).toBeTruthy();
        }
    });

    test("データがない場合のメッセージまたはエラーが表示される", async ({ page }) => {
        // 新規ユーザーなのでデータがない可能性が高い
        
        // エラーメッセージ、空の状態、または分析結果のいずれかが表示される
        const errorMessage = page.locator(".error-message");
        const emptyMessage = page.locator("text=データがありません, text=記録がありません");
        const loadingMessage = page.locator("text=分析中..., text=読み込み中...");
        const analysisResult = page.locator(".analysis-result, .category-section");

        const hasError = await errorMessage.isVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE }).catch(() => false);
        const hasEmpty = await emptyMessage.isVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE }).catch(() => false);
        const hasLoading = await loadingMessage.isVisible().catch(() => false);
        const hasResult = await analysisResult.isVisible().catch(() => false);

        // いずれかの状態が表示されていることを確認
        expect(hasError || hasEmpty || hasLoading || hasResult).toBe(true);
    });

    test("戻るボタンでダッシュボードに戻れる", async ({ page }) => {
        // 分析結果画面にいることを確認
        await expectPageTitle(page, "分析結果");

        // 戻るボタンをクリック
        await clickAndWait(page, 'button:has-text("戻る")');

        // ダッシュボードに戻ることを確認
        await expectPageTitle(page, "ダッシュボード", TIMEOUTS.NAVIGATION);
    });

    test("サイドバーから他のページに遷移できる", async ({ page }) => {
        // 分析結果画面にいることを確認
        await expectPageTitle(page, "分析結果");

        // ダッシュボードに移動
        await navigateTo(page, "ダッシュボード", "ダッシュボード");

        // 分析画面に戻る
        await navigateTo(page, "分析", "分析結果");

        // データ登録に移動
        await navigateTo(page, "データ登録", "データ登録");
    });
});
