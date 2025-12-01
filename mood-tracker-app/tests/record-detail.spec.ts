import { test, expect } from "@playwright/test";
import {
    createAndLoginUser,
    TIMEOUTS,
    clickAndWait,
    expectPageTitle,
    navigateTo,
} from "./helpers/test-helpers";

test.describe("記録詳細画面（RecordDetail）", () => {
    test.beforeEach(async ({ page }) => {
        // テスト前に新規ユーザーを作成してログイン
        await createAndLoginUser(page);
    });

    test("記録一覧から詳細画面に遷移できる", async ({ page }) => {
        // 記録一覧に移動
        await navigateTo(page, "記録一覧", "記録一覧");

        // 記録カードが存在する場合のみ
        const recordCards = page.locator(".record-card");
        const count = await recordCards.count();

        if (count > 0) {
            // 最初の記録カードをクリック
            await clickAndWait(page, ".record-card >> nth=0");

            // 記録詳細画面に遷移することを確認
            await expectPageTitle(page, "記録詳細", TIMEOUTS.NAVIGATION);
        } else {
            test.skip();
        }
    });

    test("ダッシュボードから詳細画面に遷移できる", async ({ page }) => {
        // ダッシュボードにいることを確認
        await expectPageTitle(page, "ダッシュボード");

        // 記録カードが存在する場合のみ
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

    test("一覧に戻るボタンで記録一覧に戻れる", async ({ page }) => {
        // まず記録一覧に移動
        await navigateTo(page, "記録一覧", "記録一覧");

        const recordCards = page.locator(".record-card");
        const count = await recordCards.count();

        if (count > 0) {
            // 詳細画面に移動
            await clickAndWait(page, ".record-card >> nth=0");
            await expectPageTitle(page, "記録詳細", TIMEOUTS.NAVIGATION);

            // 一覧に戻るボタンをクリック
            await clickAndWait(page, 'button:has-text("一覧に戻る")');

            // 記録一覧画面に戻ることを確認
            await expectPageTitle(page, "記録一覧", TIMEOUTS.NAVIGATION);
        } else {
            test.skip();
        }
    });

    test("記録詳細の基本情報が表示される", async ({ page }) => {
        // 記録一覧に移動
        await navigateTo(page, "記録一覧", "記録一覧");

        const recordCards = page.locator(".record-card");
        const count = await recordCards.count();

        if (count > 0) {
            // 詳細画面に移動
            await clickAndWait(page, ".record-card >> nth=0");
            await expectPageTitle(page, "記録詳細", TIMEOUTS.NAVIGATION);

            // ページタイトルが表示されることを確認
            await expectPageTitle(page, "記録詳細");

            // 記録日時が表示されることを確認
            await expect(page.locator(".record-datetime, .detail-section")).toBeVisible({
                timeout: TIMEOUTS.ELEMENT_VISIBLE,
            });
        } else {
            test.skip();
        }
    });

    test("スコア情報が表示される", async ({ page }) => {
        // 記録一覧に移動
        await navigateTo(page, "記録一覧", "記録一覧");

        const recordCards = page.locator(".record-card");
        const count = await recordCards.count();

        if (count > 0) {
            // 詳細画面に移動
            await clickAndWait(page, ".record-card >> nth=0");
            await expectPageTitle(page, "記録詳細", TIMEOUTS.NAVIGATION);

            // 気分またはモチベーションのスコアが表示されることを確認
            const emotionScore = page.locator("text=気分");
            const motivationScore = page.locator("text=モチベーション");

            const hasEmotion = await emotionScore.isVisible().catch(() => false);
            const hasMotivation = await motivationScore
                .isVisible()
                .catch(() => false);

            expect(hasEmotion || hasMotivation).toBe(true);
        } else {
            test.skip();
        }
    });

    test("サイドバーから他のページに遷移できる", async ({ page }) => {
        // 記録一覧に移動
        await navigateTo(page, "記録一覧", "記録一覧");

        const recordCards = page.locator(".record-card");
        const count = await recordCards.count();

        if (count > 0) {
            // 詳細画面に移動
            await clickAndWait(page, ".record-card >> nth=0");
            await expectPageTitle(page, "記録詳細", TIMEOUTS.NAVIGATION);

            // ダッシュボードに移動
            await navigateTo(page, "ダッシュボード", "ダッシュボード");

            // データ登録に移動
            await navigateTo(page, "データ登録", "データ登録");
        } else {
            test.skip();
        }
    });
});
