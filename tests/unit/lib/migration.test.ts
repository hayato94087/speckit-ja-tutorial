import { describe, it, expect, vi, beforeEach } from 'vitest'
import { migrateData } from '@/lib/migration'
import { CURRENT_STORAGE_VERSION } from '@/types/todo'

describe('migrateData', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-03T10:00:00.000Z'))
  })

  describe('現在のバージョン', () => {
    it('現在のバージョンのデータはそのまま返す', () => {
      const data = {
        version: CURRENT_STORAGE_VERSION,
        tasks: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: '牛乳を買う',
            completed: false,
            createdAt: '2026-02-03T10:00:00.000Z',
          },
        ],
        lastUpdated: '2026-02-03T10:00:00.000Z',
      }

      const result = migrateData(data)
      expect(result).toEqual(data)
    })

    it('無効なタスクデータは除外する', () => {
      const data = {
        version: CURRENT_STORAGE_VERSION,
        tasks: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: '有効なタスク',
            completed: false,
            createdAt: '2026-02-03T10:00:00.000Z',
          },
          {
            // 無効: idがない
            title: '無効なタスク',
            completed: false,
          },
        ],
        lastUpdated: '2026-02-03T10:00:00.000Z',
      }

      const result = migrateData(data)
      // 無効なデータがある場合はnullを返すか、有効なタスクのみ返す
      // 実装に依存
      expect(result === null || result?.tasks.length === 1).toBe(true)
    })
  })

  describe('無効なデータ', () => {
    it('nullの場合はnullを返す', () => {
      const result = migrateData(null)
      expect(result).toBeNull()
    })

    it('undefinedの場合はnullを返す', () => {
      const result = migrateData(undefined)
      expect(result).toBeNull()
    })

    it('オブジェクト以外の場合はnullを返す', () => {
      expect(migrateData('string')).toBeNull()
      expect(migrateData(123)).toBeNull()
      expect(migrateData([])).toBeNull()
    })

    it('versionがない場合はnullを返す', () => {
      const data = {
        tasks: [],
        lastUpdated: '2026-02-03T10:00:00.000Z',
      }
      const result = migrateData(data)
      expect(result).toBeNull()
    })
  })

  describe('旧バージョン（将来のマイグレーション用）', () => {
    it('未知のバージョン（将来のバージョン）はnullを返す', () => {
      const data = {
        version: 999,
        tasks: [],
        lastUpdated: '2026-02-03T10:00:00.000Z',
      }
      const result = migrateData(data)
      expect(result).toBeNull()
    })
  })
})
