import { test, expect } from '@playwright/test'

test.describe('タスクのCRUD操作', () => {
  test.beforeEach(async ({ page }) => {
    // localStorageをクリアしてから開始
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test.describe('タスクの追加（US1）', () => {
    test('Enterキーでタスクを追加できる', async ({ page }) => {
      const input = page.getByLabel('新しいタスク')
      await input.fill('牛乳を買う')
      await input.press('Enter')

      // タスクが追加されたことを確認
      await expect(page.getByText('牛乳を買う')).toBeVisible()

      // 入力欄がクリアされたことを確認
      await expect(input).toHaveValue('')
    })

    test('追加ボタンでタスクを追加できる', async ({ page }) => {
      const input = page.getByLabel('新しいタスク')
      await input.fill('レポートを提出')
      await page.getByRole('button', { name: '追加' }).click()

      // タスクが追加されたことを確認
      await expect(page.getByText('レポートを提出')).toBeVisible()

      // 入力欄がクリアされたことを確認
      await expect(input).toHaveValue('')
    })

    test('空文字は追加されない', async ({ page }) => {
      const input = page.getByLabel('新しいタスク')
      await input.fill('')
      await input.press('Enter')

      // タスクリストが空のままであることを確認
      await expect(page.getByText('タスクがありません')).toBeVisible()
    })

    test('空白のみは追加されない', async ({ page }) => {
      const input = page.getByLabel('新しいタスク')
      await input.fill('   ')
      await input.press('Enter')

      // タスクリストが空のままであることを確認
      await expect(page.getByText('タスクがありません')).toBeVisible()
    })

    test('複数のタスクを追加できる', async ({ page }) => {
      const input = page.getByLabel('新しいタスク')

      await input.fill('タスク1')
      await input.press('Enter')

      await input.fill('タスク2')
      await input.press('Enter')

      await input.fill('タスク3')
      await input.press('Enter')

      // すべてのタスクが表示されることを確認
      await expect(page.getByText('タスク1')).toBeVisible()
      await expect(page.getByText('タスク2')).toBeVisible()
      await expect(page.getByText('タスク3')).toBeVisible()
    })
  })

  test.describe('タスクの編集（US3）', () => {
    test.beforeEach(async ({ page }) => {
      // タスクを1つ追加
      const input = page.getByLabel('新しいタスク')
      await input.fill('元のタスク')
      await input.press('Enter')
    })

    test('タスクを編集して保存できる', async ({ page }) => {
      // 編集ボタンをクリック
      await page.getByRole('button', { name: /編集/ }).click()

      // 編集入力欄にフォーカス
      const editInput = page.locator('input[type="text"]').last()
      await editInput.clear()
      await editInput.fill('編集後のタスク')
      await editInput.press('Enter')

      // 編集が反映されたことを確認
      await expect(page.getByText('編集後のタスク')).toBeVisible()
      await expect(page.getByText('元のタスク')).not.toBeVisible()
    })

    test('編集をEscapeでキャンセルできる', async ({ page }) => {
      // 編集ボタンをクリック
      await page.getByRole('button', { name: '元のタスク を編集' }).click()

      // 編集入力欄で変更してEscape
      const editInput = page.locator('input[type="text"]').last()
      await editInput.clear()
      await editInput.fill('キャンセルされる変更')
      await editInput.press('Escape')

      // 元のタスクが表示されていることを確認
      await expect(page.getByText('元のタスク')).toBeVisible()
      await expect(page.getByText('キャンセルされる変更')).not.toBeVisible()
    })
  })

  test.describe('タスクの削除（US3）', () => {
    test.beforeEach(async ({ page }) => {
      // タスクを1つ追加
      const input = page.getByLabel('新しいタスク')
      await input.fill('削除するタスク')
      await input.press('Enter')
    })

    test('タスクを削除できる', async ({ page }) => {
      // 削除ボタンをクリック（正確なラベルで指定）
      await page.getByRole('button', { name: '削除するタスク を削除' }).click()

      // タスクが削除されたことを確認（リストから消える）
      await expect(
        page.getByRole('listitem').filter({ hasText: '削除するタスク' })
      ).not.toBeVisible()

      // 削除後にタスクが存在しないことを確認
      await expect(page.getByText('タスクがありません')).toBeVisible()
    })
  })
})
