/**
 * タスク名バリデーション（data-model.md §3準拠）
 */

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * タスク名をバリデートする
 * @param title - バリデート対象のタスク名
 * @returns バリデーション結果
 */
export function validateTaskTitle(title: string): ValidationResult {
  const trimmed = title.trim()

  if (trimmed.length === 0) {
    return { valid: false, error: 'タスク名を入力してください' }
  }

  if (trimmed.length > 255) {
    return { valid: false, error: 'タスク名は255文字以内で入力してください' }
  }

  return { valid: true }
}
