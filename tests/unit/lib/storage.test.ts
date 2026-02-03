import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadTasks, saveTasks, clearTasks } from '@/lib/storage'
import { STORAGE_KEY, CURRENT_STORAGE_VERSION } from '@/types/todo'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-03T10:00:00.000Z'))
  })

  describe('saveTasks', () => {
    it('タスク配列をlocalStorageに保存する', () => {
      const tasks = [
        {
          id: 'test-id-1',
          title: '牛乳を買う',
          completed: false,
          createdAt: '2026-02-03T10:00:00.000Z',
        },
      ]

      saveTasks(tasks)

      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed.version).toBe(CURRENT_STORAGE_VERSION)
      expect(parsed.tasks).toEqual(tasks)
      expect(parsed.lastUpdated).toBe('2026-02-03T10:00:00.000Z')
    })

    it('空の配列も保存できる', () => {
      saveTasks([])

      const stored = localStorage.getItem(STORAGE_KEY)
      const parsed = JSON.parse(stored!)
      expect(parsed.tasks).toEqual([])
    })
  })

  describe('loadTasks', () => {
    it('保存されたタスクを読み込む', () => {
      const tasks = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: '牛乳を買う',
          completed: false,
          createdAt: '2026-02-03T10:00:00.000Z',
        },
      ]
      saveTasks(tasks)

      const result = loadTasks()
      expect(result.tasks).toEqual(tasks)
      expect(result.warnings).toEqual([])
    })

    it('データがない場合は空配列を返す', () => {
      const result = loadTasks()
      expect(result.tasks).toEqual([])
      expect(result.warnings).toEqual([])
    })

    it('破損したJSONの場合は空配列と警告を返す', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json {{{')

      const result = loadTasks()
      expect(result.tasks).toEqual([])
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0]).toContain('復元できませんでした')
    })

    it('無効なスキーマの場合は空配列と警告を返す', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          tasks: [{ invalid: 'data' }],
          lastUpdated: '2026-02-03T10:00:00.000Z',
        })
      )

      const result = loadTasks()
      expect(result.tasks).toEqual([])
      expect(result.warnings.length).toBeGreaterThan(0)
    })
  })

  describe('clearTasks', () => {
    it('localStorageからデータを削除する', () => {
      saveTasks([
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'test',
          completed: false,
          createdAt: '2026-02-03T10:00:00.000Z',
        },
      ])
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()

      clearTasks()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })
  })
})
