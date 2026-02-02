import { test, expect } from "@playwright/test";

test.describe("タスクのフィルタリング（US4）", () => {
  test.beforeEach(async ({ page }) => {
    // localStorageをクリアしてから開始
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // タスクを追加
    const input = page.getByLabel("新しいタスク");

    await input.fill("アクティブA");
    await input.press("Enter");

    await input.fill("完了済みB");
    await input.press("Enter");

    await input.fill("アクティブC");
    await input.press("Enter");

    // 「完了済みB」を完了にする（完全一致で検索）
    const checkbox = page.getByRole("checkbox", {
      name: "完了済みB を完了にする",
    });
    await checkbox.click();
  });

  test("「すべて」フィルタで全タスクが表示される", async ({ page }) => {
    // デフォルトで「すべて」が選択されている
    await expect(page.getByText("アクティブA")).toBeVisible();
    await expect(page.getByText("完了済みB")).toBeVisible();
    await expect(page.getByText("アクティブC")).toBeVisible();
  });

  test("「未完了」フィルタで未完了タスクのみ表示される", async ({ page }) => {
    // 「未完了」タブをクリック
    await page.getByRole("tab", { name: /未完了/ }).click();

    // 未完了タスクのみ表示
    await expect(page.getByText("アクティブA")).toBeVisible();
    await expect(page.getByText("アクティブC")).toBeVisible();

    // 完了タスクは非表示
    await expect(page.getByText("完了済みB")).not.toBeVisible();
  });

  test("「完了済み」フィルタで完了タスクのみ表示される", async ({ page }) => {
    // 「完了済み」タブをクリック
    await page.getByRole("tab", { name: /完了済み/ }).click();

    // 完了タスクのみ表示
    await expect(page.getByText("完了済みB")).toBeVisible();

    // 未完了タスクは非表示
    await expect(page.getByText("アクティブA")).not.toBeVisible();
    await expect(page.getByText("アクティブC")).not.toBeVisible();
  });

  test("フィルタに件数が表示される", async ({ page }) => {
    // 各フィルタの件数を確認（日本語ラベル）
    await expect(page.getByRole("tab", { name: /すべて.*3/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /未完了.*2/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /完了済み.*1/ })).toBeVisible();
  });

  test("フィルタ切替後にタスクの状態を変更しても正しく表示される", async ({
    page,
  }) => {
    // 「未完了」フィルタに切り替え
    await page.getByRole("tab", { name: /未完了/ }).click();

    // 未完了タスクを完了にする
    const checkbox = page.getByRole("checkbox", {
      name: "アクティブA を完了にする",
    });
    await checkbox.click();

    // そのタスクはフィルタから消える
    await expect(page.getByText("アクティブA")).not.toBeVisible();

    // 件数が更新される
    await expect(page.getByRole("tab", { name: /未完了.*1/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /完了済み.*2/ })).toBeVisible();
  });

  test("空の状態でフィルタ別メッセージが表示される", async ({ page }) => {
    // すべてのタスクを完了にする
    await page.getByRole("checkbox", { name: "アクティブA を完了にする" }).click();
    await page.getByRole("checkbox", { name: "アクティブC を完了にする" }).click();

    // 「未完了」フィルタに切り替え
    await page.getByRole("tab", { name: /未完了/ }).click();

    // 空状態メッセージを確認
    await expect(page.getByText("未完了のタスクはありません")).toBeVisible();
  });
});
