import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTodos } from '@/hooks/use-todos'
import { STORAGE_KEY } from '@/types/todo'

describe('useTodos', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-03T10:00:00.000Z'))
  })

  describe('初期状態', () => {
    it('データがない場合は空配列を返す', () => {
      const { result } = renderHook(() => useTodos())

      expect(result.current.tasks).toEqual([])
      expect(result.current.isLoaded).toBe(true)
    })

    it('初期タスクが渡された場合はそれを使用する', () => {
      const initialTasks = [
        {
          id: '1',
          title: '初期タスク',
          completed: false,
          createdAt: '2026-02-03T10:00:00.000Z',
        },
      ]

      const { result } = renderHook(() => useTodos(initialTasks))

      expect(result.current.tasks).toEqual(initialTasks)
    })
  })

  describe('addTask', () => {
    it('新しいタスクを追加する', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTask('新しいタスク')
      })

      expect(result.current.tasks).toHaveLength(1)
      expect(result.current.tasks[0].title).toBe('新しいタスク')
      expect(result.current.tasks[0].completed).toBe(false)
    })

    it('localStorageに保存される', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTask('保存されるタスク')
      })

      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).not.toBeNull()
      const parsed = JSON.parse(stored!)
      expect(parsed.tasks[0].title).toBe('保存されるタスク')
    })
  })

  describe('toggleTask', () => {
    it('タスクの完了状態を切り替える', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTask('切替テスト')
      })

      const taskId = result.current.tasks[0].id

      act(() => {
        result.current.toggleTask(taskId)
      })

      expect(result.current.tasks[0].completed).toBe(true)

      act(() => {
        result.current.toggleTask(taskId)
      })

      expect(result.current.tasks[0].completed).toBe(false)
    })
  })

  describe('updateTask', () => {
    it('タスクのタイトルを更新する', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTask('元のタイトル')
      })

      const taskId = result.current.tasks[0].id

      act(() => {
        result.current.updateTask(taskId, '新しいタイトル')
      })

      expect(result.current.tasks[0].title).toBe('新しいタイトル')
    })
  })

  describe('deleteTask', () => {
    it('タスクを削除する', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTask('削除するタスク')
      })

      expect(result.current.tasks).toHaveLength(1)
      const taskId = result.current.tasks[0].id

      act(() => {
        result.current.deleteTask(taskId)
      })

      expect(result.current.tasks).toHaveLength(0)
    })
  })

  describe('restoreTask', () => {
    it('削除されたタスクを復元する', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTask('復元するタスク')
      })

      const task = result.current.tasks[0]

      act(() => {
        result.current.deleteTask(task.id)
      })

      expect(result.current.tasks).toHaveLength(0)

      act(() => {
        result.current.restoreTask(task)
      })

      expect(result.current.tasks).toHaveLength(1)
      expect(result.current.tasks[0].title).toBe('復元するタスク')
    })
  })
})
