"use client";

import { Task } from "@/types/todo";
import { TodoItem } from "./todo-item";
import { TodoEmpty } from "./todo-empty";
import { Filter } from "@/types/todo";

interface TodoListProps {
  /** 表示するタスク配列 */
  tasks: Task[];
  /** 完了切替コールバック */
  onToggle: (id: string) => void;
  /** 編集コールバック */
  onUpdate: (id: string, title: string) => void;
  /** 削除コールバック */
  onDelete: (id: string) => void;
  /** 現在のフィルタ（空状態メッセージ用） */
  filter?: Filter;
}

/**
 * タスク一覧コンポーネント（contracts/components.md §3.3準拠）
 */
export function TodoList({
  tasks,
  onToggle,
  onUpdate,
  onDelete,
  filter = "all",
}: TodoListProps) {
  if (tasks.length === 0) {
    return <TodoEmpty filter={filter} />;
  }

  return (
    <ul className="space-y-2" role="list" aria-label="タスク一覧">
      {tasks.map((task) => (
        <li key={task.id}>
          <TodoItem
            task={task}
            onToggle={() => onToggle(task.id)}
            onUpdate={(title) => onUpdate(task.id, title)}
            onDelete={() => onDelete(task.id)}
          />
        </li>
      ))}
    </ul>
  );
}
