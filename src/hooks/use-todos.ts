'use client'

import { useState, useEffect, useCallback } from 'react'
import { Task } from '@/types/todo'
import { loadTasks, saveTasks, subscribeToStorageChanges } from '@/lib/storage'
import { createTask } from '@/lib/task-factory'

export interface UseTodosReturn {
  /** タスク配列 */
  tasks: Task[]
  /** 読み込み完了フラグ */
  isLoaded: boolean
  /** 警告メッセージ（復旧時など） */
  warnings: string[]
  /** タスク追加 */
  addTask: (title: string) => void
  /** 完了切替 */
  toggleTask: (id: string) => void
  /** タスク更新 */
  updateTask: (id: string, title: string) => void
  /** タスク削除 */
  deleteTask: (id: string) => void
  /** 削除取り消し（Undo用） */
  restoreTask: (task: Task) => void
  /** 警告クリア */
  clearWarnings: () => void
}

/**
 * タスクのCRUD操作とlocalStorage同期（contracts/components.md §4.1準拠）
 * @param initialTasks - 初期タスク（テスト用）
 * @returns タスク操作用のオブジェクト
 */
export function useTodos(initialTasks?: Task[]): UseTodosReturn {
  const [tasks, setTasks] = useState<Task[]>(initialTasks ?? [])
  const [isLoaded, setIsLoaded] = useState(!!initialTasks)
  const [warnings, setWarnings] = useState<string[]>([])

  // 初期読み込み（localStorageからの同期読み込みは外部システム連携のため許容）
  useEffect(() => {
    // 初期タスクが渡された場合は何もしない
    if (initialTasks) {
      return
    }

    const result = loadTasks()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorageからの初期読み込みは外部システム同期として許容
    setTasks(result.tasks)
    setWarnings(result.warnings)
    setIsLoaded(true)
  }, [initialTasks])

  // 他タブでの変更を監視
  useEffect(() => {
    if (initialTasks) {
      return
    }

    const unsubscribe = subscribeToStorageChanges((newTasks) => {
      setTasks(newTasks)
    })

    return unsubscribe
  }, [initialTasks])

  // タスクが変更されたらlocalStorageに保存
  useEffect(() => {
    if (!isLoaded) {
      return
    }

    // 初期タスクが渡された場合は保存しない（テスト用）
    if (initialTasks) {
      return
    }

    saveTasks(tasks)
  }, [tasks, isLoaded, initialTasks])

  // タスク追加
  const addTask = useCallback((title: string) => {
    const newTask = createTask(title)
    setTasks((prev) => [...prev, newTask])
  }, [])

  // 完了切替
  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    )
  }, [])

  // タスク更新
  const updateTask = useCallback((id: string, title: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              title: title.trim(),
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    )
  }, [])

  // タスク削除
  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  // 削除取り消し
  const restoreTask = useCallback((task: Task) => {
    setTasks((prev) => [...prev, task])
  }, [])

  // 警告クリア
  const clearWarnings = useCallback(() => {
    setWarnings([])
  }, [])

  return {
    tasks,
    isLoaded,
    warnings,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    restoreTask,
    clearWarnings,
  }
}
