import { Task } from '@/types/todo'

/**
 * 新規タスクを生成する（data-model.md §2.1準拠）
 * @param title - タスク名
 * @returns 新規タスクオブジェクト
 */
export function createTask(title: string): Task {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    completed: false,
    createdAt: now,
  }
}
