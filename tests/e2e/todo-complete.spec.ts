import { test, expect } from '@playwright/test'

test.describe('タスクの完了管理（US2）', () => {
  test.beforeEach(async ({ page }) => {
    // localStorageをクリアしてから開始
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    // タスクを追加
    const input = page.getByLabel('新しいタスク')
    await input.fill('テストタスク')
    await input.press('Enter')
  })

  test('チェックボックスでタスクを完了にできる', async ({ page }) => {
    // 未完了状態を確認
    const taskText = page.getByText('テストタスク')
    await expect(taskText).not.toHaveClass(/line-through/)

    // チェックボックスをクリック
    const checkbox = page.getByRole('checkbox', { name: /テストタスク/ })
    await checkbox.click()

    // 完了状態を確認（取り消し線）
    await expect(taskText).toHaveClass(/line-through/)
  })

  test('完了したタスクを未完了に戻せる', async ({ page }) => {
    // 完了にする
    const checkbox = page.getByRole('checkbox', { name: /テストタスク/ })
    await checkbox.click()

    // 完了状態を確認
    const taskText = page.getByText('テストタスク')
    await expect(taskText).toHaveClass(/line-through/)

    // 未完了に戻す
    await checkbox.click()

    // 未完了状態を確認
    await expect(taskText).not.toHaveClass(/line-through/)
  })

  test('完了状態がリロード後も維持される', async ({ page }) => {
    // 完了にする
    const checkbox = page.getByRole('checkbox', { name: /テストタスク/ })
    await checkbox.click()

    // リロード
    await page.reload()

    // 完了状態が維持されていることを確認
    const taskText = page.getByText('テストタスク')
    await expect(taskText).toHaveClass(/line-through/)
  })

  test('Spaceキーでもタスクを完了/未完了に切り替えられる', async ({ page }) => {
    // チェックボックスにフォーカス
    const checkbox = page.getByRole('checkbox', { name: /テストタスク/ })
    await checkbox.focus()

    // Spaceキーで切替
    await checkbox.press('Space')

    // 完了状態を確認
    const taskText = page.getByText('テストタスク')
    await expect(taskText).toHaveClass(/line-through/)

    // もう一度Spaceキーで切替
    await checkbox.press('Space')

    // 未完了状態を確認
    await expect(taskText).not.toHaveClass(/line-through/)
  })
})
