'use client'

import { useState, useCallback, KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { validateTaskTitle } from '@/lib/validation'

interface TodoInputProps {
  /** タスク追加時のコールバック */
  onAdd: (title: string) => void
  /** 入力無効化（オプション） */
  disabled?: boolean
}

/**
 * タスク入力フォーム（contracts/components.md §3.2準拠）
 */
export function TodoInput({ onAdd, disabled = false }: TodoInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = useCallback(() => {
    const validation = validateTaskTitle(value)
    if (!validation.valid) {
      return
    }

    onAdd(value)
    setValue('')
  }, [value, onAdd])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="新しいタスクを入力..."
        aria-label="新しいタスク"
        aria-describedby="task-input-hint"
        maxLength={255}
        disabled={disabled}
        className="flex-1"
      />
      <Button
        onClick={handleSubmit}
        disabled={disabled || !validateTaskTitle(value).valid}
        aria-label="タスクを追加"
      >
        追加
      </Button>
      <span id="task-input-hint" className="sr-only">
        タスク名を入力してEnterまたは追加ボタンで追加
      </span>
    </div>
  )
}
