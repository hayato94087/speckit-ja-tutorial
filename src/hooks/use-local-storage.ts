'use client'

import { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'

export interface UseLocalStorageReturn<T> {
  /** 保存された値 */
  value: T | null
  /** 読み込み完了フラグ */
  isLoaded: boolean
  /** 値を保存 */
  setValue: (value: T) => void
  /** 値を削除 */
  removeValue: () => void
  /** エラー */
  error: Error | null
}

/**
 * localStorageの読み書き抽象化フック（contracts/components.md §4.2準拠）
 * @param key - localStorageのキー
 * @param schema - Zodスキーマ
 * @returns ストレージ操作用のオブジェクト
 */
export function useLocalStorage<T>(
  key: string,
  schema: z.ZodType<T>
): UseLocalStorageReturn<T> {
  const [value, setValueState] = useState<T | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // 初期読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)

      if (stored === null) {
        setIsLoaded(true)
        return
      }

      const parsed = JSON.parse(stored)
      const validated = schema.parse(parsed)
      setValueState(validated)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'))
      setValueState(null)
    } finally {
      setIsLoaded(true)
    }
  }, [key, schema])

  // 値を保存
  const setValue = useCallback(
    (newValue: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(newValue))
        setValueState(newValue)
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to save'))
      }
    },
    [key]
  )

  // 値を削除
  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setValueState(null)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to remove'))
    }
  }, [key])

  return {
    value,
    isLoaded,
    setValue,
    removeValue,
    error,
  }
}
