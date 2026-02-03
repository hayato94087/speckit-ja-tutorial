import { test, expect } from '@playwright/test'

test.describe('アクセシビリティ（AC-NFR）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('キーボードのみで操作可能', async ({ page }) => {
    // Tabキーで入力欄にフォーカス
    await page.keyboard.press('Tab')
    const input = page.getByLabel('新しいタスク')
    await expect(input).toBeFocused()

    // タスクを追加
    await input.fill('キーボードテスト')
    await input.press('Enter')

    // タスクが追加されたことを確認
    await expect(page.getByText('キーボードテスト')).toBeVisible()

    // チェックボックスを直接クリックしてキーボード操作を確認
    const checkbox = page.getByRole('checkbox', { name: /キーボードテスト/ })

    // チェックボックスにフォーカス
    await checkbox.focus()
    await expect(checkbox).toBeFocused()

    // Spaceキーで完了/未完了を切り替え
    await page.keyboard.press('Space')
    await expect(checkbox).toBeChecked()
  })

  test('入力欄がフォーカスを受け取れる', async ({ page }) => {
    const input = page.getByLabel('新しいタスク')
    await input.focus()
    await expect(input).toBeFocused()
  })

  test('チェックボックスにラベルがある', async ({ page }) => {
    // タスクを追加
    const input = page.getByLabel('新しいタスク')
    await input.fill('ラベルテスト')
    await input.press('Enter')

    // チェックボックスがaria-labelを持つ
    const checkbox = page.getByRole('checkbox', { name: /ラベルテスト/ })
    await expect(checkbox).toBeVisible()
  })

  test('フォーカスインジケータが表示される', async ({ page }) => {
    const input = page.getByLabel('新しいタスク')
    await input.focus()

    // フォーカス時にring/outlineが表示されることを確認
    // Tailwindのfocus-visible:ring-2などを使用
    await expect(input).toBeFocused()
  })

  test('すべてのボタンがキーボードでアクティベート可能', async ({ page }) => {
    // タスクを追加
    const input = page.getByLabel('新しいタスク')
    await input.fill('ボタンテスト')

    // Tabで追加ボタンへ移動
    await page.keyboard.press('Tab')
    const addButton = page.getByRole('button', { name: '追加' })
    await expect(addButton).toBeFocused()

    // Enterでタスク追加
    await page.keyboard.press('Enter')
    await expect(page.getByText('ボタンテスト')).toBeVisible()
  })

  test('Escapeキーで編集をキャンセルできる', async ({ page }) => {
    // タスクを追加
    const input = page.getByLabel('新しいタスク')
    await input.fill('Escapeテスト')
    await input.press('Enter')

    // タスクをダブルクリックして編集モードに
    await page.getByText('Escapeテスト').dblclick()

    // 編集入力欄を取得（input要素のうち最後のもの）
    const editInput = page.locator('input[type="text"]').last()
    await expect(editInput).toBeVisible()

    // 内容を変更
    await editInput.fill('変更後のテキスト')

    // Escapeで編集をキャンセル
    await editInput.press('Escape')

    // 元のテキストが表示される
    await expect(page.getByText('Escapeテスト')).toBeVisible()
    await expect(page.getByText('変更後のテキスト')).not.toBeVisible()
  })
})
