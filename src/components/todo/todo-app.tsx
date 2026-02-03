'use client'

import { useCallback, useMemo } from 'react'
import { Task } from '@/types/todo'
import { useTodos } from '@/hooks/use-todos'
import { useFilter } from '@/hooks/use-filter'
import { ErrorBoundary } from '@/components/feedback/error-boundary'
import { TodoInput } from './todo-input'
import { TodoList } from './todo-list'
import { TodoFilter } from './todo-filter'
import { toast } from 'sonner'

interface TodoAppProps {
  /** 初期データ（テスト用） */
  initialTasks?: Task[]
}

function TodoAppContent({ initialTasks }: TodoAppProps) {
  const {
    tasks,
    isLoaded,
    warnings,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    restoreTask,
  } = useTodos(initialTasks)

  const { filter, setFilter, filterTasks, getCounts } = useFilter()

  // フィルタリングされたタスク
  const filteredTasks = useMemo(() => filterTasks(tasks), [filterTasks, tasks])

  // 件数
  const counts = useMemo(() => getCounts(tasks), [getCounts, tasks])

  // 削除とUndo処理
  const handleDelete = useCallback(
    (id: string) => {
      const taskToDelete = tasks.find((t) => t.id === id)
      if (!taskToDelete) return

      deleteTask(id)

      toast(`「${taskToDelete.title}」を削除しました`, {
        action: {
          label: '元に戻す',
          onClick: () => restoreTask(taskToDelete),
        },
      })
    },
    [tasks, deleteTask, restoreTask]
  )

  // 警告があれば表示して通知
  if (warnings.length > 0) {
    console.warn('データ復旧警告:', warnings)
    // 初回のみ警告を表示
    warnings.forEach((warning) => {
      toast.warning('データ復旧', {
        description: warning,
      })
    })
  }

  if (!isLoaded) {
    return (
      <div
        className="flex justify-center py-8"
        role="status"
        aria-live="polite"
      >
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* TodoInput - タスク入力フォーム */}
      <TodoInput onAdd={addTask} />

      {/* TodoFilter - フィルタUI */}
      <TodoFilter filter={filter} onFilterChange={setFilter} counts={counts} />

      {/* TodoList - タスク一覧 */}
      <TodoList
        tasks={filteredTasks}
        onToggle={toggleTask}
        onUpdate={updateTask}
        onDelete={handleDelete}
        filter={filter}
      />
    </div>
  )
}

export function TodoApp({ initialTasks }: TodoAppProps) {
  return (
    <ErrorBoundary>
      <TodoAppContent initialTasks={initialTasks} />
    </ErrorBoundary>
  )
}
