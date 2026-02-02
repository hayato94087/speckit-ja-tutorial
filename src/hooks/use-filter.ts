"use client";

import { useState, useCallback, useMemo } from "react";
import { Task, Filter } from "@/types/todo";

export interface UseFilterReturn {
  /** 現在のフィルタ */
  filter: Filter;
  /** フィルタ変更 */
  setFilter: (filter: Filter) => void;
  /** タスクをフィルタリング */
  filterTasks: (tasks: Task[]) => Task[];
  /** 件数計算 */
  getCounts: (tasks: Task[]) => { all: number; active: number; completed: number };
}

/**
 * フィルタ状態管理フック（contracts/components.md §4.3準拠）
 * @param initialFilter - 初期フィルタ
 * @returns フィルタ操作用のオブジェクト
 */
export function useFilter(initialFilter: Filter = "all"): UseFilterReturn {
  const [filter, setFilter] = useState<Filter>(initialFilter);

  const filterTasks = useCallback(
    (tasks: Task[]): Task[] => {
      switch (filter) {
        case "active":
          return tasks.filter((task) => !task.completed);
        case "completed":
          return tasks.filter((task) => task.completed);
        default:
          return tasks;
      }
    },
    [filter]
  );

  const getCounts = useCallback(
    (tasks: Task[]): { all: number; active: number; completed: number } => {
      return {
        all: tasks.length,
        active: tasks.filter((task) => !task.completed).length,
        completed: tasks.filter((task) => task.completed).length,
      };
    },
    []
  );

  return {
    filter,
    setFilter,
    filterTasks,
    getCounts,
  };
}
