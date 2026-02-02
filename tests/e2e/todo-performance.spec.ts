import { test, expect } from "@playwright/test";

test.describe("パフォーマンス（AC-NFR4）", () => {
  test("タスク追加が高速に動作する", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());

    // タスク追加の時間を計測
    const input = page.getByLabel("新しいタスク");
    await input.fill("パフォーマンステスト");

    const startAdd = Date.now();
    await input.press("Enter");
    await expect(page.getByText("パフォーマンステスト")).toBeVisible();
    const addTime = Date.now() - startAdd;

    console.log(`タスク追加の時間: ${addTime}ms`);

    // 500ms以内であることを確認
    expect(addTime).toBeLessThan(500);
  });

  test("完了切り替えが高速に動作する", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // タスクを追加
    const input = page.getByLabel("新しいタスク");
    await input.fill("完了テスト");
    await input.press("Enter");
    await expect(page.getByText("完了テスト")).toBeVisible();

    // 完了切り替えの時間を計測
    const checkbox = page.getByRole("checkbox", { name: /完了テスト/ });
    const startToggle = Date.now();
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    const toggleTime = Date.now() - startToggle;

    console.log(`完了切り替えの時間: ${toggleTime}ms`);

    // 500ms以内であることを確認
    expect(toggleTime).toBeLessThan(500);
  });

  test("フィルタ切り替えが高速に動作する", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // 複数タスクを追加
    const input = page.getByLabel("新しいタスク");

    await input.fill("アクティブタスク");
    await input.press("Enter");

    await input.fill("完了タスク");
    await input.press("Enter");

    // 1つを完了にする
    await page.getByRole("checkbox", { name: /完了タスク/ }).click();

    // フィルタ切り替えの時間を計測
    const startFilter = Date.now();
    await page.getByRole("tab", { name: /未完了/ }).click();
    await expect(page.getByText("完了タスク")).not.toBeVisible();
    const filterTime = Date.now() - startFilter;

    console.log(`フィルタ切り替えの時間: ${filterTime}ms`);

    // 500ms以内であることを確認
    expect(filterTime).toBeLessThan(500);
  });

  test("UIから多数のタスクを追加しても動作する", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const input = page.getByLabel("新しいタスク");

    // 10件のタスクを追加
    for (let i = 1; i <= 10; i++) {
      await input.fill(`タスク${i}`);
      await input.press("Enter");
    }

    // すべてのタスクが表示されることを確認（完全一致）
    await expect(page.getByText("タスク1", { exact: true })).toBeVisible();
    await expect(page.getByText("タスク10", { exact: true })).toBeVisible();

    // 件数が正しいことを確認
    await expect(page.getByRole("tab", { name: /すべて.*10/ })).toBeVisible();
  });
});
