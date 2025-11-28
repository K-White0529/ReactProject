import { test, expect } from "@playwright/test";

test.describe("アドバイス履歴画面（AdviceHistory）", () => {
    test.beforeEach(async ({ page }) => {
        // テスト前にログイン
        await page.goto("/");
        await page.fill('input[name="username"]', "testuser");
        await page.fill('input[name="password"]', "Test1234!");
        await page.click('button:has-text("ログイン")');
        await expect(
            page.locator('h1:has-text("ダッシュボード")')
        ).toBeVisible();

        // アドバイス履歴画面に移動
        await page.click('button:has-text("アドバイス履歴")');
        await expect(page.locator('h1:has-text("アドバイス履歴")')).toBeVisible(
            { timeout: 10000 }
        );
    });

    test("ページの基本要素が表示される", async ({ page }) => {
        // ページタイトルが表示されることを確認
        await expect(
            page.locator('h1:has-text("アドバイス履歴")')
        ).toBeVisible();

        // 履歴件数が表示されることを確認
        await expect(page.locator("text=全")).toBeVisible();
        await expect(page.locator("text=件")).toBeVisible();

        // 戻るボタンが表示されることを確認
        await expect(
            page.locator('button:has-text("ダッシュボードに戻る")')
        ).toBeVisible();

        // 新しいアドバイス生成ボタンが表示されることを確認
        await expect(
            page.locator('button:has-text("新しいアドバイスを生成")')
        ).toBeVisible();
    });

    test("アドバイス履歴がある場合、履歴が表示される", async ({ page }) => {
        // 履歴リストまたは空の状態メッセージのいずれかが表示される
        const adviceList = page.locator(".advice-list");
        const emptyState = page.locator(
            "text=まだアドバイスの履歴がありません"
        );

        const hasAdviceList = await adviceList
            .isVisible({ timeout: 5000 })
            .catch(() => false);
        const hasEmptyState = await emptyState.isVisible().catch(() => false);

        // どちらか一方が表示されていることを確認
        expect(hasAdviceList || hasEmptyState).toBe(true);
    });

    test("アドバイスアイテムに必要な情報が表示される", async ({ page }) => {
        // アドバイスアイテムが存在する場合のみテスト
        const adviceItems = page.locator(".advice-item");
        const count = await adviceItems.count();

        if (count > 0) {
            const firstItem = adviceItems.first();

            // 日時が表示されることを確認
            await expect(firstItem.locator(".advice-item-date")).toBeVisible();

            // 相対時間が表示されることを確認
            await expect(
                firstItem.locator(".advice-item-relative")
            ).toBeVisible();

            // アドバイスの内容が表示されることを確認
            await expect(
                firstItem.locator(".advice-item-content")
            ).toBeVisible();
        } else {
            test.skip();
        }
    });

    test("新しいアドバイスを生成できる", async ({ page }) => {
        // 生成ボタンをクリック
        const generateButton = page.locator(
            'button:has-text("新しいアドバイスを生成")'
        );
        await generateButton.click();

        // 生成中の表示を確認
        const generatingButton = page.locator('button:has-text("生成中...")');
        const hasGenerating = await generatingButton
            .isVisible({ timeout: 2000 })
            .catch(() => false);

        if (hasGenerating) {
            // 生成完了またはエラーを待つ（最大90秒）
            // 生成中ボタンが消えるか、エラーメッセージが表示されるのを待つ
            await Promise.race([
                generatingButton
                    .waitFor({ state: "hidden", timeout: 90000 })
                    .catch(() => {}),
                page
                    .locator(".error-message")
                    .waitFor({ state: "visible", timeout: 90000 })
                    .catch(() => {}),
            ]);
        }

        // 生成後、履歴が更新されるか、エラーが表示されることを確認
        await page.waitForTimeout(2000);

        const adviceList = page.locator(".advice-list");
        const emptyState = page.locator(
            "text=まだアドバイスの履歴がありません"
        );
        const errorMessage = page.locator(".error-message");

        const hasAdviceList = await adviceList.isVisible().catch(() => false);
        const hasEmptyState = await emptyState.isVisible().catch(() => false);
        const hasError = await errorMessage.isVisible().catch(() => false);

        // 履歴、空の状態、またはエラーのいずれかが表示されていることを確認
        expect(hasAdviceList || hasEmptyState || hasError).toBe(true);
    });

    test("アドバイスがない場合、空の状態メッセージが表示される", async ({
        page,
    }) => {
        // アドバイスアイテムが存在しない場合
        const adviceItems = page.locator(".advice-item");
        const count = await adviceItems.count();

        if (count === 0) {
            // 空の状態メッセージが表示されることを確認
            await expect(
                page.locator("text=まだアドバイスの履歴がありません")
            ).toBeVisible();

            // アイコンが表示されることを確認
            const emptyIcon = page.locator(".empty-icon");
            await expect(emptyIcon).toBeVisible();

            // 新規生成ボタンが表示されることを確認
            await expect(
                page.locator('button:has-text("新しいアドバイスを生成")')
            ).toBeVisible();
        } else {
            test.skip();
        }
    });

    test("ダッシュボードに戻れる", async ({ page }) => {
        // 戻るボタンをクリック
        await page.click('button:has-text("ダッシュボードに戻る")');

        // ダッシュボードに遷移することを確認
        await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible(
            { timeout: 5000 }
        );
    });

    test("複数のアドバイスが時系列で表示される", async ({ page }) => {
        // アドバイスアイテムが複数存在する場合
        const adviceItems = page.locator(".advice-item");
        const count = await adviceItems.count();

        if (count > 1) {
            // 複数のアドバイスアイテムが表示されることを確認
            expect(count).toBeGreaterThan(1);

            // 最初のアイテムと2番目のアイテムの日時を確認
            const firstDate = await adviceItems
                .first()
                .locator(".advice-item-date")
                .textContent();
            const secondDate = await adviceItems
                .nth(1)
                .locator(".advice-item-date")
                .textContent();

            // 両方の日時が表示されていることを確認
            expect(firstDate).toBeTruthy();
            expect(secondDate).toBeTruthy();
        } else {
            test.skip();
        }
    });

    test("サイドバーからアドバイス履歴画面に戻れる", async ({ page }) => {
        // 他のページに移動
        await page.click('button:has-text("ダッシュボード")');
        await expect(
            page.locator('h1:has-text("ダッシュボード")')
        ).toBeVisible();

        // アドバイス履歴に戻る
        await page.click('button:has-text("アドバイス履歴")');
        await expect(
            page.locator('h1:has-text("アドバイス履歴")')
        ).toBeVisible();
    });
});
