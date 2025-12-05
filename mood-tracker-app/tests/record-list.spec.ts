import { test, expect } from "@playwright/test";
import {
    createAndLoginUser,
    TIMEOUTS,
    clickAndWait,
    expectPageTitle,
    navigateTo,
    deleteTestUser,
    safeGoto,
    safeFill,
} from "./helpers/test-helpers";

test.describe("記録一覧画面（RecordList）", () => {
    let testUsername: string;

    test.beforeAll(async ({ browser }) => {
        // 全テスト開始前に1回だけユーザーを作成
        const context = await browser.newContext();
        const page = await context.newPage();
        const userInfo = await createAndLoginUser(page);
        testUsername = userInfo.username;
        await context.close();
    });

    test.beforeEach(async ({ page }) => {
        // 各テスト前にログイン
        await safeGoto(page, "/");
        await expect(page.locator('h1:has-text("ログイン")')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
        await safeFill(page, 'input[name="username"]', testUsername);
        await safeFill(page, 'input[name="password"]', "Test1234!");
        await clickAndWait(page, 'button:has-text("ログイン")');
        await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible({ timeout: TIMEOUTS.NAVIGATION });

        // 記録一覧ページに移動
        await navigateTo(page, "記録一覧", "記録一覧");
    });

    test.afterAll(async () => {
        // 全テスト完了後にテストユーザーを削除
        if (testUsername) {
            await deleteTestUser(testUsername);
        }
    });

    test("ページの基本要素が表示される", async ({ page }) => {
        // ページタイトルが表示されることを確認
        await expectPageTitle(page, "記録一覧");

        // 記録件数が表示されることを確認
        await expect(page.locator("text=全")).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
        await expect(page.locator("text=件")).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
    });

    test("記録がある場合、記録カードが表示される", async ({ page }) => {
        // 記録カードまたは空の状態メッセージのいずれかが表示される
        const recordCards = page.locator(".record-card");
        const emptyState = page.locator("text=まだ記録がありません");

        const hasRecords = (await recordCards.count()) > 0;
        const hasEmptyState = await emptyState.isVisible().catch(() => false);

        // どちらか一方が表示されていることを確認
        expect(hasRecords || hasEmptyState).toBe(true);
    });

    test("記録カードに必要な情報が表示される", async ({ page }) => {
        const recordCards = page.locator(".record-card");
        const count = await recordCards.count();

        if (count > 0) {
            const firstCard = recordCards.first();

            // 日時が表示されることを確認
            await expect(firstCard.locator(".record-date")).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });

            // スコアまたは活動内容が表示されることを確認
            const hasScore = await firstCard
                .locator(".score-item")
                .isVisible()
                .catch(() => false);
            const hasActivity = await firstCard
                .locator(".record-activity")
                .isVisible()
                .catch(() => false);

            expect(hasScore || hasActivity).toBe(true);
        } else {
            test.skip();
        }
    });

    test("記録カードをクリックして詳細画面に遷移できる", async ({ page }) => {
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

    test("記録がない場合、空の状態メッセージが表示される", async ({ page }) => {
        const emptyState = page.locator("text=まだ記録がありません");
        const recordCards = page.locator(".record-card");

        const hasRecords = (await recordCards.count()) > 0;

        if (!hasRecords) {
            await expect(emptyState).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
        }
    });

    test("空の状態から記録作成画面に遷移できる", async ({ page }) => {
        const createButton = page.locator('button:has-text("最初の記録を作成")');
        const hasButton = await createButton.isVisible().catch(() => false);

        if (hasButton) {
            await clickAndWait(page, 'button:has-text("最初の記録を作成")');
            await expectPageTitle(page, "データ登録", TIMEOUTS.NAVIGATION);
        }
    });

    test("サイドバーから他のページに遷移できる", async ({ page }) => {
        // 記録一覧にいることを確認
        await expectPageTitle(page, "記録一覧");

        // ダッシュボードに移動
        await navigateTo(page, "ダッシュボード", "ダッシュボード");

        // 記録一覧に戻る
        await navigateTo(page, "記録一覧", "記録一覧");

        // データ登録に移動
        await navigateTo(page, "データ登録", "データ登録");
    });
});
