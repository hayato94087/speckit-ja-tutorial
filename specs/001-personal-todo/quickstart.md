# クイックスタート

| 項目 | 値 |
| --- | --- |
| **機能名** | 個人用 ToDo アプリ |
| **作成日** | 2026-02-03 |
| **ステータス** | 完了 |

## 📑 目次

- [1. 前提条件](#-1-前提条件)
- [2. セットアップ](#-2-セットアップ)
  - [2.1 プロジェクト作成](#21-プロジェクト作成)
  - [2.2 shadcn/ui セットアップ](#22-shadcnui-セットアップ)
  - [2.3 テスト環境セットアップ](#23-テスト環境セットアップ)
- [3. ビルドと実行](#-3-ビルドと実行)
- [4. テスト実行](#-4-テスト実行)
- [5. ディレクトリ構造](#-5-ディレクトリ構造)
- [6. トラブルシューティング](#-6-トラブルシューティング)

## 📋 1. 前提条件

| ツール | バージョン | 確認コマンド |
|--------|----------|-------------|
| Node.js | 20.x LTS | `node -v` |
| pnpm | 8.x+ | `pnpm -v` |
| Git | 2.x+ | `git --version` |

**pnpmのインストール**（未インストールの場合）:

```bash
npm install -g pnpm
```

## 🚀 2. セットアップ

### 2.1 プロジェクト作成

```bash
# Next.js プロジェクト作成（App Router, TypeScript, Tailwind CSS, ESLint）
pnpm create next-app@latest todo-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd todo-app

# 追加の依存関係
pnpm add zod
pnpm add -D @types/node
```

**next.config.js** の確認:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router はデフォルトで有効
}

module.exports = nextConfig
```

### 2.2 shadcn/ui セットアップ

```bash
# shadcn/ui 初期化
pnpm dlx shadcn@latest init

# 質問への回答例:
# - Which style would you like to use? › Default
# - Which color would you like to use as base color? › Slate
# - Do you want to use CSS variables for colors? › yes
```

**必要なコンポーネントを追加**:

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add checkbox
pnpm dlx shadcn@latest add label
pnpm dlx shadcn@latest add tabs
pnpm dlx shadcn@latest add sonner  # Toast通知用
```

**Sonnerのセットアップ**:

```tsx
// src/app/layout.tsx
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

### 2.3 テスト環境セットアップ

**Vitest（Unit テスト）**:

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

**vitest.config.ts** を作成:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**tests/setup.ts** を作成:

```typescript
import '@testing-library/jest-dom'
```

**Playwright（E2E テスト）**:

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

**playwright.config.ts** を作成:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**package.json** にスクリプト追加:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## 🔨 3. ビルドと実行

**開発サーバー起動**:

```bash
pnpm dev
# http://localhost:3000 でアクセス
```

**プロダクションビルド**:

```bash
pnpm build
pnpm start
```

**リント実行**:

```bash
pnpm lint
```

## ✅ 4. テスト実行

**Unit テスト**:

```bash
# 全テスト実行
pnpm test

# ウォッチモード
pnpm test -- --watch

# カバレッジ
pnpm test -- --coverage

# UI モード
pnpm test:ui
```

**E2E テスト**:

```bash
# 全テスト実行
pnpm test:e2e

# UI モード
pnpm test:e2e:ui

# 特定ファイルのみ
pnpm test:e2e tests/e2e/todo-crud.spec.ts
```

## 📁 5. ディレクトリ構造

セットアップ完了後の構造:

```
todo-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/           # shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── label.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── sonner.tsx
│   │   ├── todo/         # 作成予定
│   │   └── feedback/     # 作成予定
│   ├── hooks/            # 作成予定
│   ├── lib/
│   │   └── utils.ts      # shadcn/ui で生成
│   └── types/            # 作成予定
├── tests/
│   ├── setup.ts
│   ├── unit/
│   └── e2e/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── next.config.js
```

## ❓ 6. トラブルシューティング

### pnpm create next-app が失敗する

```bash
# キャッシュクリア
pnpm store prune

# 再実行
pnpm create next-app@latest todo-app
```

### shadcn/ui のコンポーネントが見つからない

```bash
# 初期化を再実行
pnpm dlx shadcn@latest init --overwrite
```

### Playwright が起動しない

```bash
# ブラウザを再インストール
pnpm exec playwright install chromium --with-deps
```

### TypeScript エラー: モジュールが見つからない

```bash
# 型チェック
pnpm tsc --noEmit

# node_modules 再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### localStorage がテストで動作しない

Vitest の `jsdom` 環境では localStorage がモック済み。テストファイルで明示的にクリアする:

```typescript
beforeEach(() => {
  localStorage.clear()
})
```

### E2E テストがタイムアウトする

```typescript
// playwright.config.ts でタイムアウトを延長
export default defineConfig({
  timeout: 60000, // 60秒
  expect: {
    timeout: 10000, // 10秒
  },
})
```
