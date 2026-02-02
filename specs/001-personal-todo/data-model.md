# データモデル

| 項目 | 値 |
| --- | --- |
| **機能名** | 個人用 ToDo アプリ |
| **作成日** | 2026-02-03 |
| **ステータス** | 完了 |

## 📑 目次

- [1. 概要](#-1-概要)
- [2. エンティティ定義](#-2-エンティティ定義)
  - [2.1 Task（タスク）](#21-taskタスク)
  - [2.2 Filter（フィルタ）](#22-filterフィルタ)
  - [2.3 StorageData（ストレージデータ）](#23-storagedataストレージデータ)
- [3. バリデーションルール](#-3-バリデーションルール)
- [4. 状態遷移](#-4-状態遷移)
  - [4.1 タスクのライフサイクル](#41-タスクのライフサイクル)
  - [4.2 フィルタ状態](#42-フィルタ状態)
- [5. ストレージ設計](#-5-ストレージ設計)
  - [5.1 localStorage構造](#51-localstorage構造)
  - [5.2 キー名](#52-キー名)
- [6. マイグレーション](#-6-マイグレーション)
  - [6.1 バージョン履歴](#61-バージョン履歴)
  - [6.2 マイグレーション戦略](#62-マイグレーション戦略)

## 📋 1. 概要

個人用ToDoアプリのデータモデルを定義する。データはlocalStorageに永続化され、オフライン環境でも動作する。

**主要エンティティ**:
- Task: ToDoリストの1項目
- Filter: 表示フィルタ状態
- StorageData: localStorage保存形式

## 📦 2. エンティティ定義

### 2.1 Task（タスク）

ToDoリストの1項目を表すエンティティ。

```typescript
// src/types/todo.ts
import { z } from 'zod'

export const TaskSchema = z.object({
  /** UUID v4形式の一意識別子 */
  id: z.string().uuid(),
  
  /** タスク名（1-255文字） */
  title: z.string().min(1, 'タスク名は必須です').max(255, 'タスク名は255文字以内です'),
  
  /** 完了状態 */
  completed: z.boolean(),
  
  /** 作成日時（ISO 8601形式） */
  createdAt: z.string().datetime(),
  
  /** 更新日時（ISO 8601形式、任意） */
  updatedAt: z.string().datetime().optional(),
})

export type Task = z.infer<typeof TaskSchema>
```

**フィールド詳細**:

| フィールド | 型 | 必須 | 説明 | 制約 |
|-----------|-----|------|------|------|
| `id` | `string` | ✓ | 一意識別子 | UUID v4形式（`crypto.randomUUID()`で生成） |
| `title` | `string` | ✓ | タスク名 | 1-255文字、空白のみ不可 |
| `completed` | `boolean` | ✓ | 完了状態 | `true`: 完了、`false`: 未完了 |
| `createdAt` | `string` | ✓ | 作成日時 | ISO 8601形式 |
| `updatedAt` | `string` | - | 更新日時 | ISO 8601形式、編集時に設定 |

**ファクトリ関数**:

```typescript
// src/lib/task-factory.ts
export function createTask(title: string): Task {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    completed: false,
    createdAt: now,
  }
}
```

### 2.2 Filter（フィルタ）

タスク一覧の表示フィルタを表す列挙型。

```typescript
// src/types/todo.ts
export const FilterValues = ['all', 'active', 'completed'] as const

export const FilterSchema = z.enum(FilterValues)

export type Filter = z.infer<typeof FilterSchema>

/** フィルタの日本語ラベル */
export const FilterLabels: Record<Filter, string> = {
  all: 'すべて',
  active: '未完了',
  completed: '完了済み',
}
```

**フィルタ値**:

| 値 | ラベル | 説明 |
|----|--------|------|
| `all` | すべて | 全タスクを表示 |
| `active` | 未完了 | `completed: false` のタスクのみ |
| `completed` | 完了済み | `completed: true` のタスクのみ |

### 2.3 StorageData（ストレージデータ）

localStorageに保存するデータ構造。

```typescript
// src/types/todo.ts
export const StorageDataSchema = z.object({
  /** スキーマバージョン（マイグレーション用） */
  version: z.number().int().positive(),
  
  /** タスク配列 */
  tasks: z.array(TaskSchema),
  
  /** 最終更新日時 */
  lastUpdated: z.string().datetime(),
})

export type StorageData = z.infer<typeof StorageDataSchema>

/** 現在のスキーマバージョン */
export const CURRENT_STORAGE_VERSION = 1
```

**保存例**:

```json
{
  "version": 1,
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "牛乳を買う",
      "completed": false,
      "createdAt": "2026-02-03T10:00:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "レポートを提出",
      "completed": true,
      "createdAt": "2026-02-02T09:00:00.000Z",
      "updatedAt": "2026-02-03T14:30:00.000Z"
    }
  ],
  "lastUpdated": "2026-02-03T14:30:00.000Z"
}
```

## ✅ 3. バリデーションルール

### タスク名のバリデーション

```typescript
// src/lib/validation.ts
export const validateTaskTitle = (title: string): { valid: boolean; error?: string } => {
  const trimmed = title.trim()
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'タスク名を入力してください' }
  }
  
  if (trimmed.length > 255) {
    return { valid: false, error: 'タスク名は255文字以内で入力してください' }
  }
  
  return { valid: true }
}
```

### バリデーションルール一覧

| ルール | 条件 | エラーメッセージ |
|--------|------|------------------|
| 必須チェック | `title.trim().length === 0` | タスク名を入力してください |
| 最大長チェック | `title.length > 255` | タスク名は255文字以内で入力してください |
| UUID形式 | 無効なUUID | 内部エラー（UIには表示しない） |
| 日時形式 | 無効なISO 8601 | 内部エラー（UIには表示しない） |

## 🔄 4. 状態遷移

### 4.1 タスクのライフサイクル

```
┌─────────┐
│  作成   │ createTask(title)
└────┬────┘
     │
     ▼
┌─────────┐    toggleComplete()    ┌─────────┐
│ 未完了  │ ◄──────────────────► │  完了   │
│(active) │                        │(completed)
└────┬────┘                        └────┬────┘
     │                                  │
     │ updateTask(id, title)            │ updateTask(id, title)
     ▼                                  ▼
┌─────────┐                        ┌─────────┐
│  編集   │                        │  編集   │
└────┬────┘                        └────┬────┘
     │                                  │
     │ deleteTask(id)                   │ deleteTask(id)
     ▼                                  ▼
┌─────────┐                        ┌─────────┐
│  削除   │                        │  削除   │
└─────────┘                        └─────────┘
```

**操作と状態変化**:

| 操作 | 前状態 | 後状態 | 影響フィールド |
|------|--------|--------|----------------|
| `createTask(title)` | - | 未完了 | id, title, completed=false, createdAt |
| `toggleComplete(id)` | 未完了/完了 | 完了/未完了 | completed, updatedAt |
| `updateTask(id, title)` | 任意 | 変更なし | title, updatedAt |
| `deleteTask(id)` | 任意 | 削除 | - |

### 4.2 フィルタ状態

```
┌─────────┐
│ すべて  │ ◄──┐
│  (all)  │    │
└────┬────┘    │
     │         │
     ▼         │
┌─────────┐    │
│ 未完了  │ ───┤
│(active) │    │
└────┬────┘    │
     │         │
     ▼         │
┌──────────┐   │
│ 完了済み │ ──┘
│(completed)
└──────────┘
```

フィルタは3状態を循環可能。デフォルトは `all`。

## 💾 5. ストレージ設計

### 5.1 localStorage構造

```typescript
// src/lib/storage.ts
const STORAGE_KEY = 'todo-app-tasks'

interface StorageOperations {
  load(): StorageData | null
  save(data: StorageData): void
  clear(): void
}
```

### 5.2 キー名

| キー | 説明 | 値の型 |
|------|------|--------|
| `todo-app-tasks` | メインデータ | JSON文字列（StorageData） |

**容量見積もり**:
- 1タスク ≈ 200バイト（UUID + タイトル100文字 + メタデータ）
- 1,000タスク ≈ 200KB
- localStorage上限（5MB）に対して十分な余裕あり

## 🔀 6. マイグレーション

### 6.1 バージョン履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| 1 | 2026-02-03 | 初期スキーマ |

### 6.2 マイグレーション戦略

```typescript
// src/lib/migration.ts
type MigrationFn = (data: unknown) => StorageData | null

const migrations: Record<number, MigrationFn> = {
  // 将来のマイグレーション用
  // 0: migrateFromV0ToV1,
}

export function migrateData(data: unknown): StorageData | null {
  if (!data || typeof data !== 'object') {
    return null
  }
  
  const parsed = data as Record<string, unknown>
  const version = typeof parsed.version === 'number' ? parsed.version : 0
  
  // 現在のバージョンならそのまま返す
  if (version === CURRENT_STORAGE_VERSION) {
    const result = StorageDataSchema.safeParse(data)
    return result.success ? result.data : null
  }
  
  // 古いバージョンならマイグレーション
  if (version < CURRENT_STORAGE_VERSION && migrations[version]) {
    return migrations[version](data)
  }
  
  // 未知のバージョン（新しいバージョン）は復元不可
  return null
}
```

**旧形式の想定**:

将来的に以下のような旧形式が存在する可能性を考慮:

```typescript
// 旧形式例（バージョンなし、idがnumber）
interface LegacyTask {
  id: number
  title: string
  done: boolean  // 'completed' ではなく 'done'
}

// マイグレーション例
function migrateFromV0ToV1(data: unknown): StorageData | null {
  try {
    const legacy = data as { tasks: LegacyTask[] }
    const now = new Date().toISOString()
    
    const tasks: Task[] = legacy.tasks.map((t, index) => ({
      id: crypto.randomUUID(),
      title: t.title,
      completed: t.done ?? false,
      createdAt: now,
    }))
    
    return {
      version: CURRENT_STORAGE_VERSION,
      tasks,
      lastUpdated: now,
    }
  } catch {
    return null
  }
}
```

**復旧フローチャート**:

```
localStorage.getItem(key)
        │
        ▼
   値が存在？ ───No──→ 空データで開始
        │
       Yes
        │
        ▼
  JSON.parse成功？ ──No──→ 警告 + 空データ
        │
       Yes
        │
        ▼
  バージョン確認
        │
        ├── 現在バージョン → Zodバリデーション
        │                         │
        │                         ├── 成功 → データ使用
        │                         │
        │                         └── 失敗 → 部分復旧 or 空データ
        │
        └── 旧バージョン → マイグレーション試行
                                │
                                ├── 成功 → データ使用 + 通知
                                │
                                └── 失敗 → 警告 + 空データ
```
