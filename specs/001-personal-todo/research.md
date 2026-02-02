# 技術調査

| 項目 | 値 |
| --- | --- |
| **機能名** | 個人用 ToDo アプリ |
| **作成日** | 2026-02-03 |
| **ステータス** | 完了 |

## 📑 目次

- [1. 調査概要](#-1-調査概要)
- [2. 技術選定](#-2-技術選定)
  - [2.1 フレームワーク: Next.js App Router](#21-フレームワーク-nextjs-app-router)
  - [2.2 UIコンポーネント: shadcn/ui](#22-uiコンポーネント-shadcnui)
  - [2.3 状態管理: React Hooks](#23-状態管理-react-hooks)
  - [2.4 テストフレームワーク](#24-テストフレームワーク)
  - [2.5 バリデーション: Zod](#25-バリデーション-zod)
- [3. 実装パターン](#-3-実装パターン)
  - [3.1 localStorage永続化パターン](#31-localstorage永続化パターン)
  - [3.2 データ復旧パターン](#32-データ復旧パターン)
  - [3.3 アクセシビリティパターン](#33-アクセシビリティパターン)
  - [3.4 削除の誤操作対策](#34-削除の誤操作対策)
- [4. 解決済みの不明点](#-4-解決済みの不明点)

## 📋 1. 調査概要

本ドキュメントは、個人用ToDoアプリ実装に向けた技術調査結果をまとめたものです。

**調査対象**:
- Next.js App Routerでのクライアントサイド開発パターン
- shadcn/uiコンポーネントの選定とカスタマイズ
- localStorage永続化と復旧のベストプラクティス
- アクセシビリティ実装パターン
- テストフレームワークの選定

## 🔬 2. 技術選定

### 2.1 フレームワーク: Next.js App Router

**決定**: Next.js 14+ App Router を使用

**根拠**:
- ユーザー要件で指定されている
- App Routerはサーバーコンポーネントがデフォルトだが、`"use client"`で明示的にクライアントコンポーネント化可能
- オフラインファーストのためすべてのToDoコンポーネントは`"use client"`で実装

**検討した代替案**:
- Pages Router: 要件外（App Router指定）
- Vite + React: Next.jsが指定されているため却下

**実装ポイント**:
```tsx
// src/app/page.tsx
import { TodoApp } from '@/components/todo/todo-app'

export default function Home() {
  return <TodoApp />
}

// src/components/todo/todo-app.tsx
"use client"
// クライアントサイドのみで動作
```

### 2.2 UIコンポーネント: shadcn/ui

**決定**: shadcn/ui を必須使用（代替不可）

**使用コンポーネント**:
| コンポーネント | 用途 |
|--------------|------|
| `Button` | 追加ボタン、削除ボタン |
| `Input` | タスク入力、編集入力 |
| `Checkbox` | 完了切替 |
| `Label` | アクセシビリティ用ラベル |
| `Toast` / `Sonner` | 通知（Undo、エラー） |
| `Tabs` | フィルタ切替 |

**根拠**:
- ユーザー要件で代替不可として指定
- Radix UIベースでa11y対応済み
- Tailwind CSSとの親和性が高い

**カスタマイズ方針**:
- デフォルトスタイルを基本として使用
- 白基調、余白広め、角丸、影控えめの方針に合わせてCSS変数を調整

### 2.3 状態管理: React Hooks

**決定**: カスタムフック（useState + useEffect）で状態管理

**根拠**:
- 単一画面・単一機能のため外部状態管理ライブラリは過剰
- localStorage同期が必要なためuseEffectでの副作用管理が適切
- コンポーネント間の状態共有は props drilling または Context で十分

**検討した代替案**:
- Zustand: シンプルだが、この規模では不要
- Redux: 過剰な複雑性
- Jotai/Recoil: 学習コスト対効果が低い

**実装構成**:
```
hooks/
├── use-todos.ts         # CRUD操作 + localStorage同期
├── use-local-storage.ts # localStorage抽象化
└── use-filter.ts        # フィルタ状態
```

### 2.4 テストフレームワーク

**決定**: 
- Unit: Vitest
- E2E: Playwright

**根拠**:
- Vitest: Vite互換で高速、Jest互換API、TypeScript対応
- Playwright: クロスブラウザ対応、a11yテスト支援（@axe-core/playwright）

**検討した代替案**:
- Jest: Vitestより設定が複雑、速度で劣る
- Cypress: Playwrightより動作が重い傾向

**テスト構成**:
```
tests/
├── unit/           # Vitest
│   ├── hooks/
│   └── lib/
└── e2e/            # Playwright
    ├── *.spec.ts
    └── fixtures/
```

### 2.5 バリデーション: Zod

**決定**: Zodでランタイムバリデーション

**根拠**:
- TypeScriptとの親和性が高い
- localStorage読み込み時の破損データ検出に必須
- スキーマからTypeScript型を推論可能

**実装例**:
```typescript
import { z } from 'zod'

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
})

export type Task = z.infer<typeof TaskSchema>

export const TaskListSchema = z.array(TaskSchema)
```

## 🔧 3. 実装パターン

### 3.1 localStorage永続化パターン

**決定**: 即時保存（debounce不要）+ storage event監視

**パターン**:
```typescript
// use-local-storage.ts
const STORAGE_KEY = 'todo-app-tasks'
const STORAGE_VERSION = 1

interface StorageData {
  version: number
  tasks: Task[]
}

export function useTodos() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // 初回読み込み
  useEffect(() => {
    const data = loadFromStorage()
    setTasks(data)
    setIsLoaded(true)
  }, [])

  // 変更時に保存
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(tasks)
    }
  }, [tasks, isLoaded])

  // 他タブからの変更監視
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        // 通知を表示して再読み込み
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])
}
```

**根拠**:
- 即時保存: データ損失リスク最小化（debounceで保存前に閉じるリスク）
- storage event: 仕様の「複数タブ検知」要件を満たす

### 3.2 データ復旧パターン

**決定**: 段階的フォールバック

**復旧フロー**:
```
1. localStorage.getItem()
   ↓ 失敗（null）
   → 空配列で開始

2. JSON.parse()
   ↓ 失敗（SyntaxError）
   → 警告「データが破損しています」+ 空配列

3. Zodバリデーション
   ↓ 部分失敗
   → 有効なタスクのみ復元 + 警告

4. バージョンチェック
   ↓ 旧バージョン
   → マイグレーション試行 → 失敗時は警告 + 空配列
```

**実装例**:
```typescript
function loadFromStorage(): { tasks: Task[], warnings: string[] } {
  const warnings: string[] = []
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { tasks: [], warnings: [] }
    
    const parsed = JSON.parse(raw)
    
    // バージョンチェック & マイグレーション
    if (parsed.version !== STORAGE_VERSION) {
      const migrated = migrateData(parsed)
      if (!migrated) {
        warnings.push('データを復元できませんでした。新しい状態で開始します。')
        return { tasks: [], warnings }
      }
      return { tasks: migrated, warnings: ['データ形式を更新しました'] }
    }
    
    // バリデーション
    const result = TaskListSchema.safeParse(parsed.tasks)
    if (!result.success) {
      // 部分復旧を試行
      const validTasks = parsed.tasks.filter((t: unknown) => 
        TaskSchema.safeParse(t).success
      )
      if (validTasks.length < parsed.tasks.length) {
        warnings.push(`${parsed.tasks.length - validTasks.length}件のタスクを復元できませんでした`)
      }
      return { tasks: validTasks, warnings }
    }
    
    return { tasks: result.data, warnings: [] }
  } catch (e) {
    warnings.push('データが破損しています。新しい状態で開始します。')
    return { tasks: [], warnings }
  }
}
```

### 3.3 アクセシビリティパターン

**決定**: WAI-ARIA準拠 + shadcn/uiのa11y機能活用

**実装ポイント**:

1. **フォーカス管理**
```tsx
// タスク追加後、入力欄にフォーカスを戻す
const inputRef = useRef<HTMLInputElement>(null)

const handleAdd = () => {
  addTask(title)
  setTitle('')
  inputRef.current?.focus()
}
```

2. **Live Region（状態変更通知）**
```tsx
// 操作結果をスクリーンリーダーに通知
<div role="status" aria-live="polite" className="sr-only">
  {announcement}
</div>
```

3. **キーボードナビゲーション**
```tsx
// タスクリストでの矢印キーナビゲーション
const handleKeyDown = (e: KeyboardEvent, index: number) => {
  switch (e.key) {
    case 'ArrowDown':
      focusTask(index + 1)
      break
    case 'ArrowUp':
      focusTask(index - 1)
      break
    case 'Delete':
    case 'Backspace':
      deleteTask(index)
      break
  }
}
```

4. **適切なラベル**
```tsx
<Label htmlFor="task-input" className="sr-only">
  新しいタスク
</Label>
<Input
  id="task-input"
  placeholder="タスクを入力..."
  aria-describedby="task-input-hint"
/>
<span id="task-input-hint" className="sr-only">
  Enterキーで追加
</span>
```

### 3.4 削除の誤操作対策

**決定**: Undo通知（Toast）方式を採用

**根拠**:
- 確認ダイアログはUXを阻害（2アクション必要）
- Undo方式は1アクションで削除完了 + 5秒以内に取り消し可能
- shadcn/uiのToast（またはSonner）で実装容易

**検討した代替案**:
- 確認ダイアログ: UXが重い
- 長押し削除: モバイルでは直感的だがキーボード対応が複雑
- ゴミ箱: 追加のUI/機能が必要

**実装例**:
```tsx
import { toast } from 'sonner'

const handleDelete = (task: Task) => {
  // 即座に削除
  removeTask(task.id)
  
  // Undo通知
  toast('タスクを削除しました', {
    action: {
      label: '元に戻す',
      onClick: () => restoreTask(task),
    },
    duration: 5000,
  })
}
```

## ✅ 4. 解決済みの不明点

| 不明点 | 決定 | 根拠 |
|--------|------|------|
| テストフレームワーク | Vitest + Playwright | 速度・TypeScript対応・a11y支援 |
| 状態管理 | カスタムフック | 規模に対して外部ライブラリは過剰 |
| バリデーション | Zod | 型推論・破損検出に最適 |
| 削除の誤操作対策 | Undo Toast | UXシンプル、1アクション維持 |
| データ形式バージョン | v1（現形式） | 将来の互換性のみ考慮 |
| 複数タブ対応 | storage event | 仕様要件を満たす標準API |
