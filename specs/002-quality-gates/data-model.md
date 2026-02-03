# 📦 データモデル

| 項目 | 値 |
| --- | --- |
| **機能名** | 品質ゲート |
| **日付** | 2026-02-04 |

## 📑 目次

- [1. 概要](#-1-概要)
- [2. 設定ファイル構造](#-2-設定ファイル構造)
- [3. npm scripts定義](#-3-npm-scripts定義)
- [4. Playwright設定](#-4-playwright設定)
- [5. Prettier設定](#-5-prettier設定)

## 📋 1. 概要

この機能は品質ゲート（開発ツールと設定）のため、従来のエンティティモデルは該当しない。
代わりに、設定ファイルとスクリプトの構造を定義する。

## 📁 2. 設定ファイル構造

```text
/                           # リポジトリルート
├── package.json            # npm scripts定義
├── tsconfig.json           # TypeScript設定（既存）
├── eslint.config.mjs       # ESLint設定（既存）
├── .prettierrc             # Prettier設定（新規追加）
├── .prettierignore         # Prettierの除外設定（新規追加）
├── vitest.config.ts        # Vitest設定（既存）
├── playwright.config.ts    # Playwright設定（拡張）
└── tests/
    ├── setup.ts            # テストセットアップ（既存）
    ├── unit/               # Unitテスト（既存）
    └── e2e/                # E2Eテスト（既存）
```

## 📝 3. npm scripts定義

package.jsonに追加/更新するscripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "type-check": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "check-all": "npm run format:check && npm run lint && npm run type-check && npm run test:run && npm run test:e2e"
  }
}
```

## 🎭 4. Playwright設定

playwright.config.tsの拡張:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:3000',
    // 証跡設定
    screenshot: 'on',           // 常にスクリーンショット取得
    video: 'on',                // 常に動画取得
    trace: 'retain-on-failure', // 失敗時のみトレース保持
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## 🎨 5. Prettier設定

### .prettierrc

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

### .prettierignore

```text
# ビルド出力
.next/
out/
build/
dist/

# 依存関係
node_modules/

# テスト結果
test-results/
playwright-report/

# その他
.git/
*.md
```
