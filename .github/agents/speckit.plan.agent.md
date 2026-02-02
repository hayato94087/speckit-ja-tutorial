---
description: 計画テンプレートを使用して設計成果物を生成する実装計画ワークフローを実行します。
handoffs: 
  - label: speckit.tasks
    agent: speckit.tasks
    prompt: 計画をタスクに分解します
    send: true
  - label: speckit.checklist
    agent: speckit.checklist
    prompt: 以下のドメイン用のチェックリストを作成します...
---

## ユーザー入力

```text
$ARGUMENTS
```

続行する前に、ユーザー入力を考慮する**必要があります**（空でない場合）。

## 概要

1. **セットアップ**: リポジトリルートから `.specify/scripts/bash/setup-plan.sh --json` を実行し、JSONをパースしてFEATURE_SPEC、IMPL_PLAN、SPECS_DIR、BRANCHを取得。引数に "I'm Groot" のようなシングルクォートがある場合、エスケープ構文を使用: 例 'I'\''m Groot'（または可能なら二重引用符: "I'm Groot"）。

2. **コンテキストを読み込み**: FEATURE_SPECと `.specify/memory/constitution.md` を読み込む。IMPL_PLANテンプレート（既にコピー済み）を読み込む。

3. **スタイルガイドを読み込み**: `.specify/README.md` を読み込んで用語集とスタイルガイドを把握。
   - セクション見出しには規定の絵文字を使用する
   - 用語対応表に従って一貫した日本語表現を使用する
   - 英語維持する特殊文字列（マーカー、ステータス、ファイル名等）は変換しない

4. **計画ワークフローを実行**: IMPL_PLANテンプレートの構造に従って:
   - 技術コンテキストを記入（不明点は "NEEDS CLARIFICATION" としてマーク）
   - 憲章からConstitution Checkセクションを記入
   - ゲートを評価（正当な理由なしに違反がある場合はERROR）
   - Phase 0: research.mdを生成（すべてのNEEDS CLARIFICATIONを解決）
   - Phase 1: data-model.md、contracts/、quickstart.mdを生成
   - Phase 1: エージェントスクリプトを実行してエージェントコンテキストを更新
   - 設計後にConstitution Checkを再評価

5. **停止して報告**: コマンドはPhase 2計画後に終了。ブランチ、IMPL_PLANパス、生成された成果物を報告。

## フェーズ

### Phase 0: 概要とリサーチ

1. **上記の技術コンテキストから不明点を抽出**:
   - 各NEEDS CLARIFICATION → リサーチタスク
   - 各依存関係 → ベストプラクティスタスク
   - 各統合 → パターンタスク

2. **リサーチエージェントを生成して実行**:

   ```text
   技術コンテキストの各不明点について:
     タスク: "{機能コンテキスト}のための{不明点}をリサーチ"
   各技術選択について:
     タスク: "{ドメイン}における{技術}のベストプラクティスを調査"
   ```

3. **調査結果を統合** して `research.md` に以下の形式で記録:
   - 決定: [何を選択したか]
   - 根拠: [なぜ選択したか]
   - 検討した代替案: [他に何を評価したか]

**出力**: すべてのNEEDS CLARIFICATIONが解決されたresearch.md

### Phase 1: 設計とコントラクト

**前提条件:** `research.md` 完了

1. **機能仕様からエンティティを抽出** → `data-model.md`:
   - エンティティ名、フィールド、リレーション
   - 要件からのバリデーションルール
   - 該当する場合は状態遷移

2. **機能要件からAPIコントラクトを生成**:
   - 各ユーザーアクション → エンドポイント
   - 標準的なREST/GraphQLパターンを使用
   - OpenAPI/GraphQLスキーマを `/contracts/` に出力

3. **エージェントコンテキストの更新**:
   - `.specify/scripts/bash/update-agent-context.sh copilot` を実行
   - これらのスクリプトは使用中のAIエージェントを検出
   - 適切なエージェント固有のコンテキストファイルを更新
   - 現在の計画からの新しい技術のみを追加
   - マーカー間の手動追加を保持

**出力**: data-model.md、/contracts/*、quickstart.md、エージェント固有ファイル

## 重要なルール

- 絶対パスを使用
- ゲート失敗または未解決の明確化でERROR
