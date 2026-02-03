# 🚀 クイックスタート

| 項目 | 値 |
| --- | --- |
| **機能名** | 品質ゲート |
| **日付** | 2026-02-04 |

## 📑 目次

- [1. 概要](#-1-概要)
- [2. セットアップ](#-2-セットアップ)
- [3. 品質ゲートの実行](#-3-品質ゲートの実行)
- [4. 開発ワークフロー](#-4-開発ワークフロー)
- [5. トラブルシューティング](#-5-トラブルシューティング)

## 📋 1. 概要

このドキュメントでは、品質ゲートの実行手順を説明する。

**品質ゲート一覧**:
1. 型チェック (`type-check`)
2. リント (`lint`)
3. フォーマットチェック (`format:check`)
4. Unitテスト (`test:run`)
5. E2Eテスト (`test:e2e`)

## 🔧 2. セットアップ

### 2.1 依存関係のインストール

```bash
npm install
```

### 2.2 Playwrightブラウザのインストール

```bash
npx playwright install
```

## ✅ 3. 品質ゲートの実行

### 3.1 個別実行

```bash
# 型チェック
npm run type-check

# リント
npm run lint

# リント（自動修正）
npm run lint:fix

# フォーマットチェック
npm run format:check

# フォーマット適用
npm run format

# Unitテスト（単発）
npm run test:run

# Unitテスト（watchモード）
npm run test

# E2Eテスト
npm run test:e2e

# E2Eテスト（UIモード）
npm run test:e2e:ui
```

### 3.2 一括実行

コミット前に全チェックを実行:

```bash
npm run check-all
```

このコマンドは以下を順番に実行する:
1. `format:check` - フォーマット違反チェック
2. `lint` - リント違反チェック
3. `type-check` - 型エラーチェック
4. `test:run` - Unitテスト実行
5. `test:e2e` - E2Eテスト実行

### 3.3 推奨実行順序

1. **フォーマット適用**: `npm run format`
2. **リント確認**: `npm run lint`
3. **型チェック**: `npm run type-check`
4. **Unitテスト**: `npm run test:run`
5. **E2Eテスト**: `npm run test:e2e`

## 👨‍💻 4. 開発ワークフロー

### 4.1 日常の開発

```bash
# 1. 開発サーバー起動
npm run dev

# 2. 別ターミナルでUnitテストをwatchモードで実行
npm run test

# 3. コード編集（エディタのformat on saveを有効化推奨）
```

### 4.2 コミット前

```bash
# 全チェックを実行
npm run check-all

# すべてPASSしたらコミット
git add .
git commit -m "feat: 機能の説明"
```

### 4.3 E2Eテストのデバッグ

```bash
# UIモードで実行（ステップ実行可能）
npm run test:e2e:ui

# 特定のテストのみ実行
npx playwright test todo-crud

# レポートを表示
npx playwright show-report
```

### 4.4 証跡の確認

E2Eテスト実行後、以下で証跡を確認:

```bash
# HTMLレポートを開く
npx playwright show-report

# test-results/ にスクリーンショット・動画が保存される
ls test-results/
```

## ❓ 5. トラブルシューティング

### 5.1 型エラー

```bash
# エラー箇所を確認
npm run type-check

# VS Codeの問題パネルでも確認可能
```

### 5.2 リントエラー

```bash
# 自動修正を試す
npm run lint:fix

# 手動修正が必要な場合はエラーメッセージを確認
```

### 5.3 フォーマットエラー

```bash
# 自動適用
npm run format
```

### 5.4 Unitテスト失敗

```bash
# UIモードでデバッグ
npm run test:ui
```

### 5.5 E2Eテスト失敗

```bash
# UIモードでステップ実行
npm run test:e2e:ui

# トレースを確認
npx playwright show-report

# 特定テストのみ実行
npx playwright test -g "タスクを追加"
```

### 5.6 開発サーバーが起動しない

```bash
# ポート3000が使用中か確認
lsof -i :3000

# 使用中のプロセスを終了
kill -9 <PID>
```
