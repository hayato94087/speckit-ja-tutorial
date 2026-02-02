# コンポーネントコントラクト

| 項目 | 値 |
| --- | --- |
| **機能名** | 個人用 ToDo アプリ |
| **作成日** | 2026-02-03 |
| **ステータス** | 完了 |

## 📑 目次

- [1. 概要](#-1-概要)
- [2. コンポーネント一覧](#-2-コンポーネント一覧)
- [3. コンポーネント詳細](#-3-コンポーネント詳細)
  - [3.1 TodoApp](#31-todoapp)
  - [3.2 TodoInput](#32-todoinput)
  - [3.3 TodoList](#33-todolist)
  - [3.4 TodoItem](#34-todoitem)
  - [3.5 TodoFilter](#35-todofilter)
  - [3.6 TodoEmpty](#36-todoempty)
- [4. カスタムフック](#-4-カスタムフック)
  - [4.1 useTodos](#41-usetodos)
  - [4.2 useLocalStorage](#42-uselocalstorage)
  - [4.3 useFilter](#43-usefilter)
- [5. ユーティリティ関数](#-5-ユーティリティ関数)

## 📋 1. 概要

本ドキュメントはToDoアプリのコンポーネントとフックのインターフェース仕様を定義する。

**設計原則**:
- 単一責任: 各コンポーネントは1つの役割に集中
- Props駆動: 状態は親から受け取り、イベントで通知
- a11y対応: すべてのインタラクティブ要素にキーボード操作とラベル

## 📦 2. コンポーネント一覧

```
src/components/
├── todo/
│   ├── todo-app.tsx         # メインコンテナ
│   ├── todo-input.tsx       # タスク入力
│   ├── todo-list.tsx        # タスク一覧
│   ├── todo-item.tsx        # 個別タスク
│   ├── todo-filter.tsx      # フィルタUI
│   └── todo-empty.tsx       # 空状態
└── feedback/
    ├── toast.tsx            # 通知
    └── error-boundary.tsx   # エラー境界
```

## 🔧 3. コンポーネント詳細

### 3.1 TodoApp

**ファイル**: `src/components/todo/todo-app.tsx`

**役割**: ToDoアプリのルートコンテナ。状態管理とレイアウトを担当。

```typescript
"use client"

interface TodoAppProps {
  /** 初期データ（テスト用） */
  initialTasks?: Task[]
}

export function TodoApp({ initialTasks }: TodoAppProps): JSX.Element
```

**責務**:
- `useTodos` フックで状態管理
- `useFilter` フックでフィルタ管理
- 子コンポーネントへのprops配布
- Live Region（スクリーンリーダー通知）

**レイアウト**:
```
┌────────────────────────────────┐
│          TodoInput             │
├────────────────────────────────┤
│          TodoFilter            │
├────────────────────────────────┤
│          TodoList              │
│   ┌────────────────────────┐   │
│   │      TodoItem          │   │
│   ├────────────────────────┤   │
│   │      TodoItem          │   │
│   └────────────────────────┘   │
│        or TodoEmpty            │
└────────────────────────────────┘
```

### 3.2 TodoInput

**ファイル**: `src/components/todo/todo-input.tsx`

**役割**: 新規タスクの入力フォーム。

```typescript
interface TodoInputProps {
  /** タスク追加時のコールバック */
  onAdd: (title: string) => void
  /** 入力無効化（オプション） */
  disabled?: boolean
}

export function TodoInput({ onAdd, disabled }: TodoInputProps): JSX.Element
```

**振る舞い**:
| 操作 | 結果 |
|------|------|
| 入力 + Enter | `onAdd(title)` 呼び出し、入力クリア |
| 入力 + 追加ボタン | `onAdd(title)` 呼び出し、入力クリア |
| 空入力 + 確定 | 何もしない、フォーカス維持 |
| 255文字超過 | 入力を制限（maxLength） |

**a11y要件**:
- `aria-label="新しいタスク"`
- `aria-describedby` でヒント提供
- フォーカス可視化（ring）

### 3.3 TodoList

**ファイル**: `src/components/todo/todo-list.tsx`

**役割**: タスク一覧の表示とキーボードナビゲーション。

```typescript
interface TodoListProps {
  /** 表示するタスク配列 */
  tasks: Task[]
  /** 完了切替コールバック */
  onToggle: (id: string) => void
  /** 編集コールバック */
  onUpdate: (id: string, title: string) => void
  /** 削除コールバック */
  onDelete: (id: string) => void
}

export function TodoList({ tasks, onToggle, onUpdate, onDelete }: TodoListProps): JSX.Element
```

**振る舞い**:
| 操作 | 結果 |
|------|------|
| タスク0件 | `TodoEmpty` を表示 |
| タスクあり | `TodoItem` をリスト表示 |
| 矢印キー | タスク間フォーカス移動 |

**a11y要件**:
- `role="list"` または `<ul>`
- キーボードナビゲーション（矢印キー）

### 3.4 TodoItem

**ファイル**: `src/components/todo/todo-item.tsx`

**役割**: 個別タスクの表示と操作。

```typescript
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

export function TodoItem({ task, onToggle, onUpdate, onDelete }: TodoItemProps): JSX.Element
```

**表示状態**:
```
通常モード:
┌──────────────────────────────────────┐
│ [✓] タスク名                    [編集][削除] │
└──────────────────────────────────────┘

編集モード:
┌──────────────────────────────────────┐
│ [入力フィールド]              [保存][キャンセル] │
└──────────────────────────────────────┘
```

**振る舞い**:
| 操作 | 結果 |
|------|------|
| チェックボックス クリック | `onToggle()` |
| Space/Enter（フォーカス時） | `onToggle()` |
| 編集ボタン | 編集モードへ |
| 編集中 Enter | `onUpdate(title)` 、通常モードへ |
| 編集中 Escape | キャンセル、通常モードへ |
| 削除ボタン | `onDelete()` 、Toast通知（Undo付き） |

**a11y要件**:
- チェックボックスに `aria-label="タスク名 を完了にする"`
- 完了時 `aria-checked="true"`
- 編集ボタンに `aria-label="タスク名 を編集"`
- 削除ボタンに `aria-label="タスク名 を削除"`

**スタイル**:
- 完了タスク: `line-through text-muted-foreground`
- フォーカス: `ring-2 ring-ring`
- タップ領域: 最小44x44px

### 3.5 TodoFilter

**ファイル**: `src/components/todo/todo-filter.tsx`

**役割**: フィルタ切替UI。

```typescript
interface TodoFilterProps {
  /** 現在のフィルタ */
  filter: Filter
  /** フィルタ変更コールバック */
  onFilterChange: (filter: Filter) => void
  /** 各フィルタの件数 */
  counts: {
    all: number
    active: number
    completed: number
  }
}

export function TodoFilter({ filter, onFilterChange, counts }: TodoFilterProps): JSX.Element
```

**表示**:
```
┌─────────────────────────────────────┐
│ [すべて (5)] [未完了 (3)] [完了済み (2)] │
└─────────────────────────────────────┘
```

**振る舞い**:
| 操作 | 結果 |
|------|------|
| タブ クリック | `onFilterChange(filter)` |
| Tab キー | フィルタ間移動 |
| Enter/Space | 選択中フィルタを適用 |

**a11y要件**:
- `role="tablist"` + `role="tab"`
- `aria-selected` で選択状態
- 件数を読み上げ

### 3.6 TodoEmpty

**ファイル**: `src/components/todo/todo-empty.tsx`

**役割**: タスク0件時のメッセージ表示。

```typescript
interface TodoEmptyProps {
  /** 現在のフィルタ（メッセージ分岐用） */
  filter: Filter
}

export function TodoEmpty({ filter }: TodoEmptyProps): JSX.Element
```

**表示メッセージ**:
| フィルタ | メッセージ |
|----------|----------|
| `all` | タスクがありません。上の入力欄から追加してください。 |
| `active` | 未完了のタスクはありません。 |
| `completed` | 完了済みのタスクはありません。 |

## 🪝 4. カスタムフック

### 4.1 useTodos

**ファイル**: `src/hooks/use-todos.ts`

**役割**: タスクのCRUD操作とlocalStorage同期。

```typescript
interface UseTodosReturn {
  /** タスク配列 */
  tasks: Task[]
  /** 読み込み完了フラグ */
  isLoaded: boolean
  /** 警告メッセージ（復旧時など） */
  warnings: string[]
  /** タスク追加 */
  addTask: (title: string) => void
  /** 完了切替 */
  toggleTask: (id: string) => void
  /** タスク更新 */
  updateTask: (id: string, title: string) => void
  /** タスク削除 */
  deleteTask: (id: string) => void
  /** 削除取り消し（Undo用） */
  restoreTask: (task: Task) => void
  /** 警告クリア */
  clearWarnings: () => void
}

export function useTodos(initialTasks?: Task[]): UseTodosReturn
```

### 4.2 useLocalStorage

**ファイル**: `src/hooks/use-local-storage.ts`

**役割**: localStorageの読み書き抽象化。

```typescript
interface UseLocalStorageReturn<T> {
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

export function useLocalStorage<T>(
  key: string,
  schema: z.ZodType<T>
): UseLocalStorageReturn<T>
```

### 4.3 useFilter

**ファイル**: `src/hooks/use-filter.ts`

**役割**: フィルタ状態管理とタスクフィルタリング。

```typescript
interface UseFilterReturn {
  /** 現在のフィルタ */
  filter: Filter
  /** フィルタ変更 */
  setFilter: (filter: Filter) => void
  /** タスクをフィルタリング */
  filterTasks: (tasks: Task[]) => Task[]
  /** 件数計算 */
  getCounts: (tasks: Task[]) => { all: number; active: number; completed: number }
}

export function useFilter(initialFilter?: Filter): UseFilterReturn
```

## 🔧 5. ユーティリティ関数

**ファイル**: `src/lib/utils.ts`

```typescript
/** クラス名結合（clsx + tailwind-merge） */
export function cn(...inputs: ClassValue[]): string

/** 日付フォーマット（表示用） */
export function formatDate(isoString: string): string
```

**ファイル**: `src/lib/validation.ts`

```typescript
/** タスク名バリデーション */
export function validateTaskTitle(title: string): { valid: boolean; error?: string }
```

**ファイル**: `src/lib/storage.ts`

```typescript
/** localStorage読み込み（復旧付き） */
export function loadTasks(): { tasks: Task[]; warnings: string[] }

/** localStorage保存 */
export function saveTasks(tasks: Task[]): void

/** localStorage クリア */
export function clearTasks(): void
```

**ファイル**: `src/lib/task-factory.ts`

```typescript
/** 新規タスク生成 */
export function createTask(title: string): Task
```
