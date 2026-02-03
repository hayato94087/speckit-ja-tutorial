import {
  Task,
  StorageData,
  STORAGE_KEY,
  CURRENT_STORAGE_VERSION,
} from '@/types/todo'
import { migrateData } from './migration'

export interface LoadTasksResult {
  tasks: Task[]
  warnings: string[]
}

/**
 * localStorageからタスクを読み込む（復旧付き）
 * @returns タスク配列と警告メッセージ
 */
export function loadTasks(): LoadTasksResult {
  const warnings: string[] = []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return { tasks: [], warnings: [] }
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(stored)
    } catch {
      warnings.push(
        '保存されたデータを復元できませんでした。新しいリストで開始します。'
      )
      return { tasks: [], warnings }
    }

    // マイグレーションを試行
    const migrated = migrateData(parsed)

    if (!migrated) {
      warnings.push(
        '保存されたデータの形式が古いか破損しています。新しいリストで開始します。'
      )
      return { tasks: [], warnings }
    }

    return { tasks: migrated.tasks, warnings }
  } catch {
    warnings.push(
      'データの読み込み中にエラーが発生しました。新しいリストで開始します。'
    )
    return { tasks: [], warnings }
  }
}

/**
 * タスクをlocalStorageに保存する
 * @param tasks - 保存するタスク配列
 */
export function saveTasks(tasks: Task[]): void {
  const data: StorageData = {
    version: CURRENT_STORAGE_VERSION,
    tasks,
    lastUpdated: new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * localStorageからデータを削除する
 */
export function clearTasks(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * storage eventを監視するためのコールバック型
 */
export type StorageChangeCallback = (tasks: Task[]) => void

/**
 * 他タブでの変更を監視する
 * @param callback - 変更時に呼ばれるコールバック
 * @returns クリーンアップ関数
 */
export function subscribeToStorageChanges(
  callback: StorageChangeCallback
): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      const result = loadTasks()
      callback(result.tasks)
    }
  }

  window.addEventListener('storage', handler)

  return () => {
    window.removeEventListener('storage', handler)
  }
}
