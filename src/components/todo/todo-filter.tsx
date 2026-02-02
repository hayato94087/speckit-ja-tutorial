"use client";

import { Filter, FilterLabels } from "@/types/todo";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TodoFilterProps {
  /** 現在のフィルタ */
  filter: Filter;
  /** フィルタ変更コールバック */
  onFilterChange: (filter: Filter) => void;
  /** 各フィルタの件数 */
  counts: {
    all: number;
    active: number;
    completed: number;
  };
}

/**
 * フィルタUIコンポーネント（contracts/components.md §3.5準拠）
 */
export function TodoFilter({ filter, onFilterChange, counts }: TodoFilterProps) {
  return (
    <Tabs
      value={filter}
      onValueChange={(value) => onFilterChange(value as Filter)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all" aria-selected={filter === "all"}>
          {FilterLabels.all} ({counts.all})
        </TabsTrigger>
        <TabsTrigger value="active" aria-selected={filter === "active"}>
          {FilterLabels.active} ({counts.active})
        </TabsTrigger>
        <TabsTrigger value="completed" aria-selected={filter === "completed"}>
          {FilterLabels.completed} ({counts.completed})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
