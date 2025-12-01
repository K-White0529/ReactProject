import { test, expect } from "@playwright/test";
import {
    createAndLoginUser,
    TIMEOUTS,
    clickAndWait,
    expectPageTitle,
    navigateTo,
} from "./helpers/test-helpers";

test.describe("アドバイス履歴画面（AdviceHistory）", () => {
    test.beforeEach(async ({ page }) => {
        // テスト前に新規ユーザーを作成してログイン
        await createAndLoginUser(page);

        // アドバイス履歴画面に移動
        await clickAndWait(page, 'button:has-text("アドバイス履歴")');
        await expectPageTitle(page, "アドバイス履歴", TIMEOUTS.NAVIGATION);
    });

    test("ページの基本要素が表示される", async ({ page }) => {
        // ページタイトルが表示されることを確認
        await expectPageTitle(page, "アドバイス履歴");

        // 履歴件数が表示されることを確認
        await expect(page.locator("text=全")).toBeVisible({
            timeout: TIMEOUTS.ELEMENT_VISIBLE,
        });
        await expect(page.locator("text=件")).toBeVisible({
            timeout: TIMEOUTS.ELEMENT_VISIBLE,
        });

        // 戻るボタンが表示されることを確認
        await expect(
            page.locator('button:has-text("ダッシュボードに戻る")')
        ).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });

        // 新しいアドバイス生成ボタンが表示されることを確認
        await expect(
            page.locator('button:has-text("新しいアドバイスを生成")')
        ).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
    });

    test("履歴がある場合、アドバイスカードが表示される", async ({ page }) => {
        // 履歴カードまたは空の状態メッセージのいずれかが表示される
        const adviceCards = page.locator(".advice-history-card, .history-card");
        const emptyState = page.locator("text=まだアドバイス履歴がありません");

        const hasCards = (await adviceCards.count()) > 0;
        const hasEmptyState = await emptyState.isVisible().catch(() => false);

        // どちらか一方が表示されていることを確認
        expect(hasCards || hasEmptyState).toBe(true);
    });

    test("新しいアドバイスを生成できる", async ({ page }) => {
        // 新しいアドバイス生成ボタンをクリック
        await page.click('button:has-text("新しいアドバイスを生成")');

        // ローディング状態を確認
        const loadingIndicator = page.locator("text=生成中..., text=読み込み中...");
        const hasLoading = await loadingIndicator
            .isVisible({ timeout: 2000 })
            .catch(() => false);

        // アドバイスが生成されるまで待つ（最大40秒）
        await page.waitForTimeout(TIMEOUTS.AI_GENERATION);

        // 成功メッセージまたは新しいカードが表示されることを確認
        const successMessage = page.locator("text=アドバイスを生成しました");
        const adviceCards = page.locator(".advice-history-card, .history-card");

        const hasSuccess = await successMessage.isVisible().catch(() => false);
        const hasNewCard = (await adviceCards.count()) > 0;

        expect(hasSuccess || hasNewCard).toBe(true);
    });

    test("ダッシュボードに戻るボタンが機能する", async ({ page }) => {
        // アドバイス履歴画面にいることを確認
        await expectPageTitle(page, "アドバイス履歴");

        // ダッシュボードに戻るボタンをクリック
        await clickAndWait(page, 'button:has-text("ダッシュボードに戻る")');

        // ダッシュボードに遷移することを確認
        await expectPageTitle(page, "ダッシュボード", TIMEOUTS.NAVIGATION);
    });

    test("サイドバーから他のページに遷移できる", async ({ page }) => {
        // アドバイス履歴画面にいることを確認
        await expectPageTitle(page, "アドバイス履歴");

        // ダッシュボードに移動
        await navigateTo(page, "ダッシュボード", "ダッシュボード");

        // アドバイス履歴に戻る
        await clickAndWait(page, 'button:has-text("アドバイス履歴")');
        await expectPageTitle(page, "アドバイス履歴", TIMEOUTS.NAVIGATION);

        // データ登録に移動
        await navigateTo(page, "データ登録", "データ登録");
    });

    test("履歴がない場合、空の状態メッセージが表示される", async ({ page }) => {
        const adviceCards = page.locator(".advice-history-card, .history-card");
        const emptyState = page.locator("text=まだアドバイス履歴がありません");

        const hasCards = (await adviceCards.count()) > 0;

        if (!hasCards) {
            await expect(emptyState).toBeVisible({
                timeout: TIMEOUTS.ELEMENT_VISIBLE,
            });
        }
    });

    test("履歴カードに日付が表示される", async ({ page }) => {
        const adviceCards = page.locator(".advice-history-card, .history-card");
        const count = await adviceCards.count();

        if (count > 0) {
            const firstCard = adviceCards.first();

            // 日付が表示されることを確認
            const dateElement = firstCard.locator(
                ".advice-date, .history-date, text=/\\d{4}/\\d{2}/\\d{2}/"
            );
            const hasDate = await dateElement.isVisible().catch(() => false);

            expect(hasDate).toBe(true);
        } else {
            test.skip();
        }
    });
});
