'use client'

import { useState, useCallback, KeyboardEvent, useRef, useEffect } from 'react'
import { Task } from '@/types/todo'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Pencil, Trash2, Check, X } from 'lucide-react'

interface TodoItemProps {
  /** タスクデータ */
  task: Task
  /** 完了切替コールバック */
  onToggle: () => void
  /** 編集コールバック */
  onUpdate: (title: string) => void
  /** 削除コールバック */
  onDelete: () => void
}

/**
 * 個別タスクコンポーネント（contracts/components.md §3.4準拠）
 */
export function TodoItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)

  // 編集モードになったらフォーカス
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = useCallback(() => {
    setEditValue(task.title)
    setIsEditing(true)
  }, [task.title])

  const handleSaveEdit = useCallback(() => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== task.title) {
      onUpdate(trimmed)
    }
    setIsEditing(false)
  }, [editValue, task.title, onUpdate])

  const handleCancelEdit = useCallback(() => {
    setEditValue(task.title)
    setIsEditing(false)
  }, [task.title])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSaveEdit()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleCancelEdit()
      }
    },
    [handleSaveEdit, handleCancelEdit]
  )

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 rounded-lg border p-4">
        <Input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSaveEdit}
          maxLength={255}
          className="flex-1"
          aria-label={`${task.title} を編集`}
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSaveEdit}
          aria-label="保存"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCancelEdit}
          aria-label="キャンセル"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border p-4 group">
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={onToggle}
        aria-label={`${task.title} を${task.completed ? '未完了に' : '完了に'}する`}
        className="h-6 w-6 min-h-[44px] min-w-[44px] flex items-center justify-center"
      />
      <label
        htmlFor={`task-${task.id}`}
        onDoubleClick={handleStartEdit}
        className={cn(
          'flex-1 cursor-pointer select-none min-h-[44px] flex items-center',
          task.completed && 'line-through text-muted-foreground'
        )}
      >
        {task.title}
      </label>
      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleStartEdit}
          aria-label={`${task.title} を編集`}
          className="min-h-[44px] min-w-[44px]"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          aria-label={`${task.title} を削除`}
          className="text-destructive hover:text-destructive min-h-[44px] min-w-[44px]"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
