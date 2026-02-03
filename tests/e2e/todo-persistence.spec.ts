import { test, expect } from '@playwright/test'

test.describe('データの永続化と復旧（US5）', () => {
  test.beforeEach(async ({ page }) => {
    // localStorageをクリアしてから開始
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('タスクがリロード後に復元される', async ({ page }) => {
    // タスクを追加
    const input = page.getByLabel('新しいタスク')
    await input.fill('永続化テスト')
    await input.press('Enter')

    // タスクが表示されることを確認
    await expect(page.getByText('永続化テスト')).toBeVisible()

    // リロード
    await page.reload()

    // タスクが復元されることを確認
    await expect(page.getByText('永続化テスト')).toBeVisible()
  })

  test('完了状態がリロード後も維持される', async ({ page }) => {
    // タスクを追加して完了にする
    const input = page.getByLabel('新しいタスク')
    await input.fill('完了状態テスト')
    await input.press('Enter')

    const checkbox = page.getByRole('checkbox', { name: /完了状態テスト/ })
    await checkbox.click()

    // リロード
    await page.reload()

    // 完了状態が維持されていることを確認
    const taskText = page.getByText('完了状態テスト')
    await expect(taskText).toHaveClass(/line-through/)
  })

  test('破損したJSONでもアプリがクラッシュしない', async ({ page }) => {
    // localStorageに不正なJSONを設定
    await page.evaluate(() => {
      localStorage.setItem('todo-app-tasks', 'invalid json {{{')
    })

    // ページをリロード
    await page.reload()

    // アプリが正常に表示される
    await expect(page.getByLabel('新しいタスク')).toBeVisible()
    await expect(page.getByText('タスクがありません')).toBeVisible()
  })

  test('無効なスキーマでもアプリがクラッシュしない', async ({ page }) => {
    // localStorageに無効なスキーマのデータを設定
    await page.evaluate(() => {
      localStorage.setItem(
        'todo-app-tasks',
        JSON.stringify({
          version: 1,
          tasks: [{ invalid: 'data' }],
          lastUpdated: '2026-02-03T10:00:00.000Z',
        })
      )
    })

    // ページをリロード
    await page.reload()

    // アプリが正常に表示される
    await expect(page.getByLabel('新しいタスク')).toBeVisible()
  })
})
