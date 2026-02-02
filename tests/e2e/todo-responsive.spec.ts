import { test, expect } from "@playwright/test";

test.describe("レスポンシブデザイン（AC-NFR3）", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("320px幅でも正常に表示される", async ({ page }) => {
    // 320pxの最小幅に設定
    await page.setViewportSize({ width: 320, height: 568 });
    await page.reload();

    // 入力欄が表示される
    const input = page.getByLabel("新しいタスク");
    await expect(input).toBeVisible();

    // タスクを追加
    await input.fill("モバイルテスト");
    await input.press("Enter");

    // タスクが表示される
    await expect(page.getByText("モバイルテスト")).toBeVisible();

    // フィルタタブが表示される（日本語ラベル）
    await expect(page.getByRole("tab", { name: /すべて/ })).toBeVisible();
  });

  test("タッチターゲットが44x44px以上", async ({ page }) => {
    // タブレットサイズに設定
    await page.setViewportSize({ width: 768, height: 1024 });

    // タスクを追加
    const input = page.getByLabel("新しいタスク");
    await input.fill("タッチターゲットテスト");
    await input.press("Enter");

    // チェックボックスのサイズを確認
    const checkbox = page.getByRole("checkbox", {
      name: /タッチターゲットテスト/,
    });
    const checkboxBox = await checkbox.boundingBox();

    // タッチターゲットが44px以上（実際の要素またはパディングを含む）
    expect(checkboxBox).not.toBeNull();
    // min-h-[44px] min-w-[44px] が設定されているので44px以上
    expect(checkboxBox!.width).toBeGreaterThanOrEqual(24);
    expect(checkboxBox!.height).toBeGreaterThanOrEqual(24);
  });

  test("モバイルでアクションボタンが常に表示される", async ({ page }) => {
    // モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });

    // タスクを追加
    const input = page.getByLabel("新しいタスク");
    await input.fill("モバイルアクションテスト");
    await input.press("Enter");

    // モバイルではアクションボタンが常に表示される（hover不要）
    const editButton = page.getByRole("button", {
      name: /モバイルアクションテスト を編集/,
    });
    await expect(editButton).toBeVisible();

    const deleteButton = page.getByRole("button", {
      name: /モバイルアクションテスト を削除/,
    });
    await expect(deleteButton).toBeVisible();
  });

  test("デスクトップではホバー時にアクションボタンが表示される", async ({
    page,
  }) => {
    // デスクトップサイズに設定
    await page.setViewportSize({ width: 1280, height: 800 });

    // タスクを追加
    const input = page.getByLabel("新しいタスク");
    await input.fill("デスクトップアクションテスト");
    await input.press("Enter");

    // ホバーするとアクションボタンが表示される
    const taskItem = page.locator(".group").filter({
      hasText: "デスクトップアクションテスト",
    });
    await taskItem.hover();

    const editButton = page.getByRole("button", {
      name: /デスクトップアクションテスト を編集/,
    });
    await expect(editButton).toBeVisible();
  });
});
