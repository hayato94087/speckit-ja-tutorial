"use client";

import { Filter, FilterLabels } from "@/types/todo";

interface TodoEmptyProps {
  /** 現在のフィルタ（メッセージ分岐用） */
  filter: Filter;
}

/**
 * 空状態表示コンポーネント（contracts/components.md §3.6準拠）
 */
export function TodoEmpty({ filter }: TodoEmptyProps) {
  const messages: Record<Filter, string> = {
    all: "タスクがありません。上の入力欄から追加してください。",
    active: "未完了のタスクはありません。",
    completed: "完了済みのタスクはありません。",
  };

  return (
    <div className="rounded-lg border p-8 text-center">
      <p className="text-muted-foreground">{messages[filter]}</p>
    </div>
  );
}
