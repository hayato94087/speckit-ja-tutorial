# 憲章

| 項目 | 値 |
|------|-----|
| **プロジェクト名** | [PROJECT_NAME] |
| **バージョン** | [CONSTITUTION_VERSION] |
| **承認日** | [RATIFICATION_DATE] |
| **最終修正日** | [LAST_AMENDED_DATE] |

<!-- 例: プロジェクト名: SpecKit, バージョン: 2.1.1, 承認日: 2025-06-13, 最終修正日: 2025-07-16 -->

## 📋 目次

<!-- 目次ルール: ##（h2）と ###（h3）レベルの見出しまで含め、番号を付与する -->
<!-- エージェントがセクション構成に基づいて動的に生成 -->

- [1. コアプリンシプル](#-1-コアプリンシプル)
  - [1.1 [PRINCIPLE_1_NAME]](#11-principle_1_name)
  - [1.2 [PRINCIPLE_2_NAME]](#12-principle_2_name)
  - [1.3 [PRINCIPLE_3_NAME]](#13-principle_3_name)
  - [1.4 [PRINCIPLE_4_NAME]](#14-principle_4_name)
  - [1.5 [PRINCIPLE_5_NAME]](#15-principle_5_name)
- [2. [SECTION_2_NAME]](#-2-section_2_name)
- [3. [SECTION_3_NAME]](#-3-section_3_name)
- [4. ガバナンス](#-4-ガバナンス)

## 🎯 1. コアプリンシプル

### 1.1 [PRINCIPLE_1_NAME]
<!-- 例: I. ライブラリファースト -->
[PRINCIPLE_1_DESCRIPTION]
<!-- 例: すべての機能はスタンドアロンライブラリとして始まる。ライブラリは自己完結型で、独立してテスト可能で、ドキュメント化されている必要がある。明確な目的が必要 - 組織化のみのライブラリは不可 -->

### 1.2 [PRINCIPLE_2_NAME]
<!-- 例: II. CLIインターフェース -->
[PRINCIPLE_2_DESCRIPTION]
<!-- 例: すべてのライブラリはCLI経由で機能を公開。テキスト入出力プロトコル: stdin/args → stdout, エラー → stderr。JSON + 人間が読める形式をサポート -->

### 1.3 [PRINCIPLE_3_NAME]
<!-- 例: III. テストファースト（絶対） -->
[PRINCIPLE_3_DESCRIPTION]
<!-- 例: TDD必須: テスト作成 → ユーザー承認 → テスト失敗 → 実装。Red-Green-Refactorサイクルを厳密に守る -->

### 1.4 [PRINCIPLE_4_NAME]
<!-- 例: IV. 統合テスト -->
[PRINCIPLE_4_DESCRIPTION]
<!-- 例: 統合テストが必要なフォーカス領域: 新規ライブラリのコントラクトテスト、コントラクト変更、サービス間通信、共有スキーマ -->

### 1.5 [PRINCIPLE_5_NAME]
<!-- 例: V. オブザーバビリティ, VI. バージョニングと破壊的変更, VII. シンプルさ -->
[PRINCIPLE_5_DESCRIPTION]
<!-- 例: テキストI/Oによるデバッグ性の確保。構造化ロギング必須。または: MAJOR.MINOR.BUILD形式。または: シンプルに始める、YAGNI原則 -->

## [EMOJI_2] 2. [SECTION_2_NAME]
<!-- 例: 🛠️ 技術スタック, 🔒 セキュリティ要件, ⚡ パフォーマンス基準, など -->

[SECTION_2_CONTENT]
<!-- 例: 技術スタック要件, コンプライアンス基準, デプロイポリシー, など -->

## [EMOJI_3] 3. [SECTION_3_NAME]
<!-- 例: 📝 開発ワークフロー, 👀 レビュープロセス, ✅ 品質ゲート, など -->

[SECTION_3_CONTENT]
<!-- 例: コードレビュー要件, テストゲート, デプロイ承認プロセス, など -->

## ⚖️ 4. ガバナンス
<!-- 例: 憲章は他のすべてのプラクティスに優先する。修正にはドキュメント化、承認、移行計画が必要 -->

[GOVERNANCE_RULES]
<!-- 例: すべてのPR/レビューはコンプライアンスを確認する必要がある。複雑性は正当化が必要。ランタイム開発ガイダンスには[GUIDANCE_FILE]を使用 -->
