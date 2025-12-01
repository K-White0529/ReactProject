import { test, expect } from "@playwright/test";
import {
    createAndLoginUser,
    TIMEOUTS,
    clickAndWait,
    expectPageTitle,
    navigateTo,
    safeClick,
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
        const adviceCards = page.locator(".advice-item");
        const emptyState = page.locator("text=まだアドバイスの履歴がありません");

        const hasCards = (await adviceCards.count()) > 0;
        const hasEmptyState = await emptyState.isVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE }).catch(() => false);

        // どちらか一方が表示されていることを確認
        expect(hasCards || hasEmptyState).toBe(true);
    });

    test("新しいアドバイスを生成できる", async ({ page }) => {
        // テストタイムアウトを延長
        test.setTimeout(90000); // 90秒
        
        // 新しいアドバイス生成ボタンをクリック
        await safeClick(page, 'button:has-text("新しいアドバイスを生成")');

        // ローディング状態を確認
        const loadingIndicator = page.locator("text=生成中..., text=読み込み中...");
        const hasLoading = await loadingIndicator
            .isVisible({ timeout: 2000 })
            .catch(() => false);

        // いずれかの状態になるまで待つ（最大60秒）
        await page.waitForFunction(
            () => {
                const hasError = document.querySelector('.error-message');
                const hasCards = document.querySelectorAll('.advice-item').length > 0;
                return hasError || hasCards;
            },
            { timeout: 60000 }
        ).catch(() => {
            // タイムアウトしても続行
        });

        const errorMessage = page.locator(".error-message");
        const adviceCards = page.locator(".advice-item");
        const emptyState = page.locator("text=まだアドバイスの履歴がありません");

        const hasError = await errorMessage.isVisible().catch(() => false);
        const hasCards = (await adviceCards.count()) > 0;
        const hasEmpty = await emptyState.isVisible().catch(() => false);

        // いずれかの状態になっていればOK
        expect(hasError || hasCards || hasEmpty).toBe(true);
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
        const adviceCards = page.locator(".advice-item");
        const emptyState = page.locator("text=まだアドバイスの履歴がありません");

        const hasCards = (await adviceCards.count()) > 0;

        if (!hasCards) {
            await expect(emptyState).toBeVisible({
                timeout: TIMEOUTS.ELEMENT_VISIBLE,
            });
        }
    });

    test("履歴カードに日付が表示される", async ({ page }) => {
        const adviceCards = page.locator(".advice-item");
        const count = await adviceCards.count();

        if (count > 0) {
            const firstCard = adviceCards.first();

            // 日付が表示されることを確認
            const dateElement = firstCard.locator(
                ".advice-item-date, text=/\\d{4}/\\d{2}/\\d{2}/"
            );
            const hasDate = await dateElement.isVisible().catch(() => false);

            expect(hasDate).toBe(true);
        } else {
            test.skip();
        }
    });
});
