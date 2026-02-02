import { z } from "zod";

/**
 * タスクスキーマ（data-model.md §2.1準拠）
 * ToDoリストの1項目を表すエンティティ
 */
export const TaskSchema = z.object({
  /** UUID v4形式の一意識別子 */
  id: z.string().uuid(),

  /** タスク名（1-255文字） */
  title: z
    .string()
    .min(1, "タスク名は必須です")
    .max(255, "タスク名は255文字以内です"),

  /** 完了状態 */
  completed: z.boolean(),

  /** 作成日時（ISO 8601形式） */
  createdAt: z.string().datetime(),

  /** 更新日時（ISO 8601形式、任意） */
  updatedAt: z.string().datetime().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

/**
 * フィルタスキーマ（data-model.md §2.2準拠）
 * タスク一覧の表示フィルタを表す列挙型
 */
export const FilterValues = ["all", "active", "completed"] as const;
export const FilterSchema = z.enum(FilterValues);
export type Filter = z.infer<typeof FilterSchema>;

/** フィルタの日本語ラベル */
export const FilterLabels: Record<Filter, string> = {
  all: "すべて",
  active: "未完了",
  completed: "完了済み",
};

/**
 * ストレージデータスキーマ（data-model.md §2.3準拠）
 * localStorageに保存するデータ構造
 */
export const StorageDataSchema = z.object({
  /** スキーマバージョン（マイグレーション用） */
  version: z.number().int().positive(),

  /** タスク配列 */
  tasks: z.array(TaskSchema),

  /** 最終更新日時 */
  lastUpdated: z.string().datetime(),
});

export type StorageData = z.infer<typeof StorageDataSchema>;

/** 現在のスキーマバージョン */
export const CURRENT_STORAGE_VERSION = 1;

/** localStorageのキー名 */
export const STORAGE_KEY = "todo-app-tasks";
