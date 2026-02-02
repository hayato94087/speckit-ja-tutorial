# タスク

| 項目 | 内容 |
|------|------|
| **機能名** | 個人用 ToDo アプリ |
| **ブランチ** | `001-personal-todo` |
| **日付** | 2026-02-03 |
| **入力** | `/specs/001-personal-todo/` の設計ドキュメント |
| **前提条件** | plan.md（必須）、spec.md（必須）、research.md、data-model.md、contracts/components.md、quickstart.md |

## 📑 目次

- [1. フォーマット凡例](#-1-フォーマット凡例)
- [2. パス規約](#-2-パス規約)
- [3. Phase](#-3-phase)
- [4. 依存関係と実行順序](#-4-依存関係と実行順序)
- [5. 実装戦略](#-5-実装戦略)
- [6. 注意事項](#-6-注意事項)

**テスト**: 本機能ではspec.mdでテストが必須と定義されているため、Unit/E2Eテストを含めています。

**構成**: タスクはユーザーストーリーごとにグループ化され、各ストーリーの独立した実装とテストを可能にします。

## 📖 1. フォーマット凡例

**ストーリーID凡例**:

| ID | spec.md参照 | 優先度 | 説明 |
|----|-------------|--------|------|
| `US1` | §3.1 | P1 | タスクの素早い追加 |
| `US2` | §3.2 | P1 | タスクの完了管理 |
| `US3` | §3.3 | P1 | タスクの編集と削除 |
| `US4` | §3.4 | P2 | タスク一覧のフィルタリング |
| `US5` | §3.5 | P1 | データの永続化と復旧 |

**優先度凡例**:

| 優先度 | 意味 | 説明 |
|--------|------|------|
| P1 | 必須 | MVPに必須。これがないとリリースできない |
| P2 | 重要 | MVPに含めたい。時間が許せば実装 |

**タスク記法**: `[ID] [P?] [Story] 説明`

| 記法 | 意味 | 説明 |
|------|------|------|
| `[P]` | 並列実行可能 | 異なるファイル、依存関係なし |
| `[US1]` `[US2]`... | ストーリーID | spec.md §3.x と対応するユーザーストーリー |
| `T001` `T002`... | タスクID | 連番でタスクを識別 |

## 📁 2. パス規約

| 項目 | パス |
|------|------|
| ソースコード | `src/` |
| コンポーネント | `src/components/` |
| フック | `src/hooks/` |
| ユーティリティ | `src/lib/` |
| 型定義 | `src/types/` |
| Unitテスト | `tests/unit/` |
| E2Eテスト | `tests/e2e/` |

## 🚀 3. Phase

### 3.1: セットアップ（共有インフラストラクチャ）

**目的**: プロジェクトの初期化と基本構造、開発環境とツールチェーンを構築

- [x] T001 quickstart.md §2.1に従ってNext.jsプロジェクトを作成（App Router, TypeScript, Tailwind CSS, pnpm）
- [x] T002 quickstart.md §2.2に従ってshadcn/uiをセットアップし、必要なコンポーネントを追加（Button, Input, Checkbox, Label, Tabs, Sonner）
- [x] T003 [P] quickstart.md §2.3に従ってVitest（Unit）をセットアップ - vitest.config.ts、tests/setup.ts
- [x] T004 [P] quickstart.md §2.3に従ってPlaywright（E2E）をセットアップ - playwright.config.ts
- [x] T005 [P] package.jsonにテスト用スクリプトを追加（test, test:ui, test:e2e, test:e2e:ui）
- [x] T006 src/app/layout.tsxにルートレイアウトを作成（lang="ja"、Toaster配置）
- [x] T007 src/app/page.tsxにメインページの空のTodoAppコンポーネントを配置
- [x] T008 src/components/todo/todo-app.tsxに"use client"でTodoAppのスケルトンを作成

> **✅ チェックポイント**: `pnpm dev`でローカル起動、`pnpm build`でビルド成功、shadcn/ui Button表示確認、`pnpm test`と`pnpm test:e2e`が実行可能

### 3.2: 基盤（ブロッキング前提条件）

**目的**: すべてのユーザーストーリーを実装する前に完了する必要があるコアインフラストラクチャ（型定義、ストレージ、バリデーション）

**⚠️ 重要**: このフェーズが完了するまでユーザーストーリーの作業を開始できません

- [x] T009 src/types/todo.tsにTask型とTaskSchemaを定義（Zod、data-model.md §2.1準拠）
- [x] T010 [P] src/types/todo.tsにFilter型とFilterSchemaを定義（data-model.md §2.2準拠）
- [x] T011 [P] src/types/todo.tsにStorageData型とStorageDataSchemaを定義（data-model.md §2.3準拠）
- [x] T012 src/lib/validation.tsにvalidateTaskTitle関数を実装（data-model.md §3準拠）
- [x] T013 src/lib/task-factory.tsにcreateTask関数を実装（data-model.md §2.1準拠）
- [x] T014 src/lib/utils.tsにcn関数（clsx + tailwind-merge）を実装
- [x] T015 [P] tests/unit/lib/validation.test.tsにバリデーションのUnitテストを作成
- [x] T016 [P] tests/unit/lib/task-factory.test.tsにcreateTaskのUnitテストを作成

> **✅ チェックポイント**: 基盤準備完了 - 型定義とバリデーションが動作、Unitテスト通過。ユーザーストーリーの実装を開始可能

### 3.3: US5 - データの永続化と復旧 [P1]

**目標**: localStorageを使ったデータ永続化と破損/旧形式からの安全な復旧を実装

**独立テスト**: タスクを追加後リロードでデータ復元確認、破損JSON設定後もクラッシュせず警告表示

> **注意**: US5は他のすべてのユーザーストーリー（US1-4）の基盤となるため、最初に実装します

#### US5のテスト

- [x] T017 [P] [US5] tests/unit/lib/storage.test.tsにストレージ読み書きのUnitテストを作成
- [x] T018 [P] [US5] tests/unit/lib/migration.test.tsにマイグレーション/復旧のUnitテストを作成
- [x] T019 [P] [US5] tests/unit/hooks/use-local-storage.test.tsにuseLocalStorageのUnitテストを作成
- [x] T020 [P] [US5] tests/unit/hooks/use-todos.test.tsにuseTodosのUnitテストを作成

#### US5の実装

- [x] T021 [US5] src/lib/storage.tsにloadTasks関数を実装（復旧付き、data-model.md §5準拠）
- [x] T022 [US5] src/lib/storage.tsにsaveTasks関数を実装
- [x] T023 [US5] src/lib/migration.tsにマイグレーション/復旧ロジックを実装（破損JSON→空データ+警告、旧形式→変換試行）
- [x] T024 [US5] src/hooks/use-local-storage.tsにuseLocalStorageフックを実装（contracts/components.md §4.2準拠）
- [x] T025 [US5] src/hooks/use-todos.tsにuseTodosフックを実装（contracts/components.md §4.1準拠）
- [x] T026 [US5] src/lib/storage.tsにstorage event監視（他タブ変更検知）を実装

> **✅ チェックポイント**: US5が完全に機能 - localStorage読み書き、破損データ復旧、他タブ検知が動作

### 3.4: US1 - タスクの素早い追加 [P1]

**目標**: タスク名を入力して素早くToDoリストに追加できる

**独立テスト**: 入力欄にタスク名入力→Enter→一覧に追加される、空文字は追加されない

#### US1のテスト

- [x] T027 [P] [US1] tests/e2e/todo-crud.spec.tsにタスク追加のE2Eテストを作成（Enter確定、ボタン確定、空文字拒否）

#### US1の実装

- [x] T028 [US1] src/components/todo/todo-input.tsxにTodoInputコンポーネントを実装（contracts/components.md §3.2準拠）
- [x] T029 [US1] TodoInputにEnterキーで追加、追加後クリア、空文字拒否、255文字制限を実装
- [x] T030 [US1] TodoInputにaria-label、フォーカス管理、スクリーンリーダー通知を追加
- [x] T031 [US1] src/components/todo/todo-app.tsxにTodoInputを統合

> **✅ チェックポイント**: US1が完全に機能 - タスク追加が動作、キーボード操作対応、a11y対応

### 3.5: US2 - タスクの完了管理 [P1]

**目標**: タスクを完了/未完了に切り替え、視覚的に区別できる

**独立テスト**: チェックボックスクリック→完了状態切替、取り消し線表示、リロード後も状態維持

#### US2のテスト

- [x] T032 [P] [US2] tests/e2e/todo-complete.spec.tsに完了切替のE2Eテストを作成（完了→未完了、視覚的区別）

#### US2の実装

- [x] T033 [US2] src/components/todo/todo-item.tsxにTodoItemコンポーネントの基本構造を作成（contracts/components.md §3.4準拠）
- [x] T034 [US2] TodoItemにチェックボックスと完了状態の視覚的区別（取り消し線）を実装
- [x] T035 [US2] TodoItemにSpace/Enterキーで完了切替、aria-checked、状態変更通知を実装
- [x] T036 [US2] src/components/todo/todo-list.tsxにTodoListコンポーネントを実装（contracts/components.md §3.3準拠）
- [x] T037 [US2] src/components/todo/todo-empty.tsxにTodoEmptyコンポーネントを実装（contracts/components.md §3.6準拠）
- [x] T038 [US2] src/components/todo/todo-app.tsxにTodoListを統合

> **✅ チェックポイント**: US2が完全に機能 - 完了切替、視覚的区別、キーボード操作対応

### 3.6: US3 - タスクの編集と削除 [P1]

**目標**: 既存のタスク名を編集でき、不要なタスクを削除できる（Undo付き）

**独立テスト**: 編集モード→タスク名変更→Enter→保存、Escape→キャンセル、削除→Toast通知

#### US3のテスト

- [x] T039 [P] [US3] tests/e2e/todo-crud.spec.ts（T027で作成済み）に編集/削除のE2Eテストを追加（編集保存、キャンセル、削除）

#### US3の実装

- [x] T040 [US3] TodoItemに編集モード（インライン編集）を実装（Enter保存、Escape キャンセル）
- [x] T041 [US3] TodoItemに削除ボタンとonDeleteコールバックを実装
- [x] T042 [US3] src/components/feedback/toast.tsxまたはSonnerでUndo通知を実装（削除後の復元機能）
- [x] T043 [US3] useTodosにrestoreTask（Undo用）機能を追加
- [x] T044 [US3] TodoItemに編集/削除のaria-label、キーボード操作を追加

> **✅ チェックポイント**: US3が完全に機能 - 編集/削除が動作、Undoで復元可能、キーボード操作対応

### 3.7: US4 - タスク一覧のフィルタリング [P2]

**目標**: タスク一覧を「すべて」「未完了」「完了済み」でフィルタリングできる

**独立テスト**: フィルタ切替で表示タスクが絞り込まれる、件数が正しく表示される

#### US4のテスト

- [x] T045 [P] [US4] tests/e2e/todo-filter.spec.tsにフィルタ切替のE2Eテストを作成

#### US4の実装

- [x] T046 [US4] src/hooks/use-filter.tsにuseFilterフックを実装（contracts/components.md §4.3準拠）
- [x] T047 [US4] src/components/todo/todo-filter.tsxにTodoFilterコンポーネントを実装（contracts/components.md §3.5準拠、Tabs使用）
- [x] T048 [US4] TodoFilterに件数表示、キーボード操作（Tab/矢印キー）、aria-selected を追加
- [x] T049 [US4] TodoEmptyにフィルタ別メッセージを追加
- [x] T050 [US4] src/components/todo/todo-app.tsxにTodoFilterを統合

> **✅ チェックポイント**: US4が完全に機能 - 3種フィルタ切替、件数表示、キーボード操作対応

### 3.8: 仕上げとクロスカッティング関心事

**目的**: E2Eテスト追加、a11y確認、パフォーマンス検証、最終品質確認

- [x] T051 [P] tests/e2e/todo-persistence.spec.tsにデータ永続化/復旧のE2Eテストを作成
- [x] T052 [P] tests/e2e/todo-a11y.spec.tsにアクセシビリティのE2Eテストを作成（キーボード操作、フォーカス）
- [x] T053 src/components/feedback/error-boundary.tsxにエラー境界コンポーネントを実装
- [x] T054 TodoAppにエラー境界、ローディング状態、ストレージ容量警告を追加
- [x] T055 全コンポーネントのレスポンシブ対応確認（320px幅、44x44pxタップ領域）
- [x] T056 パフォーマンス確認（E2Eテストで高速応答を検証）
- [x] T057 全Unitテスト実行・修正（39テスト 100%通過）
- [x] T058 全E2Eテスト実行・修正（36テスト 100%通過）
- [x] T059 ビルド確認・最終検証完了

> **✅ チェックポイント**: 全テスト通過、本番リリース準備完了

## 🔗 4. 依存関係と実行順序

### 4.1 フェーズの依存関係

| フェーズ | 依存先 | 説明 |
|---------|--------|------|
| Phase 1: セットアップ | なし | すぐに開始可能 |
| Phase 2: 基盤 | Phase 1 | 型定義とバリデーション |
| Phase 3: US5 | Phase 2 | ストレージ層（全USの基盤） |
| Phase 4: US1 | Phase 3 | タスク追加 |
| Phase 5: US2 | Phase 4 | 完了管理（TodoItemが必要） |
| Phase 6: US3 | Phase 5 | 編集/削除（TodoItemに追加） |
| Phase 7: US4 | Phase 3 | フィルタ（US1-3と並列可能） |
| Phase 8: 仕上げ | 全US | すべてのユーザーストーリー完了後 |

### 4.2 ユーザーストーリーの依存関係

| ストーリー | 優先度 | 依存先 | 備考 |
|-----------|--------|--------|------|
| US5 | P1 | Phase 2 | 全ストーリーの基盤、最初に実装 |
| US1 | P1 | US5 | タスク追加にはストレージが必要 |
| US2 | P1 | US1 | TodoItemはUS1の後に実装 |
| US3 | P1 | US2 | TodoItemの編集/削除機能追加 |
| US4 | P2 | US5, US2 | TodoList（US2）が必要。US3と並列可能 |

### 4.3 各ユーザーストーリー内

- テストは実装前に書かれ、失敗する必要がある（TDD）
- ユーティリティの前にフック
- フックの前にコンポーネント
- 統合の前にコア実装
- 次の優先度に移る前にストーリー完了

### 4.4 並列化の機会

- `[P]`マークされたタスクは並列実行可能
- Phase 2のT015, T016は並列実行可能
- US5のテスト（T017-T020）は並列実行可能
- US4はUS1-3と一部並列可能（ただしTodoListが必要）

## 🎯 5. 実装戦略

### 5.1 MVPファースト（US5 + US1 + US2 + US3）

1. Phase 1: セットアップを完了
2. Phase 2: 基盤を完了
3. Phase 3: US5（ストレージ）を完了
4. Phase 4: US1（追加）を完了
5. Phase 5: US2（完了管理）を完了
6. Phase 6: US3（編集/削除）を完了
7. **停止して検証**: MVP（P1機能）を独立してテスト
8. 準備ができたらデプロイ/デモ

### 5.2 インクリメンタルデリバリー

1. セットアップ + 基盤を完了 → 基盤準備完了
2. US5を追加 → 独立してテスト → ストレージ動作確認
3. US1を追加 → 独立してテスト → タスク追加可能
4. US2を追加 → 独立してテスト → 完了管理可能
5. US3を追加 → 独立してテスト → 編集/削除可能（**MVP!**）
6. US4を追加 → 独立してテスト → フィルタ機能追加
7. 仕上げ → 全テスト通過 → 本番リリース

### 5.3 推奨MVPスコープ

**最小MVP**: US5 + US1 + US2 + US3（P1機能すべて）

- タスクの追加/完了/編集/削除が可能
- データがリロード後も復元される
- オフラインで動作

**フルリリース**: MVP + US4

- フィルタ機能を追加

## 📌 6. 注意事項

### ⚙️ 記法ルール

- `[P]`タスク = 異なるファイル、依存関係なし
- `[USn]`ラベル = タスクをspec.mdのユーザーストーリーにマップ

### ⚠️ 必須ルール

- 各ユーザーストーリーは独立して完了可能でテスト可能である必要がある
- 実装前にテストが失敗することを確認（TDD）
- 各タスクまたは論理的なグループの後にコミット
- 任意のチェックポイントで停止してストーリーを独立して検証

### ❌ 避けること

- 曖昧なタスク
- 同じファイルの競合
- 独立性を壊すストーリー間の依存関係

### 📝 プロジェクト固有の注意

- **テスト必須**: 仕様でUnit/E2Eテストが必須のため、各ストーリーにテストタスクを含めています
- **US5が最初**: データ永続化（US5）は他のすべてのストーリーの基盤となるため、最初に実装します
- **shadcn/ui必須**: UIコンポーネントはshadcn/uiを使用（代替不可）
- **a11y必須**: キーボード操作、フォーカス可視化、aria-labelは各コンポーネントに必須
- **誤操作対策**: 削除時はUndo通知を採用（research.md §3.4）
