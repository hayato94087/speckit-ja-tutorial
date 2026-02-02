---
description: 利用可能な設計成果物に基づいて、既存のタスクをアクション可能な依存関係順のGitHub Issueに変換します。
tools: ['github/github-mcp-server/issue_write']
---

## ユーザー入力

```text
$ARGUMENTS
```

続行する前に、ユーザー入力を考慮する**必要があります**（空でない場合）。

## 概要

1. リポジトリルートから `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` を実行し、FEATURE_DIRとAVAILABLE_DOCSリストをパース。すべてのパスは絶対パスである必要があります。引数に "I'm Groot" のようなシングルクォートがある場合、エスケープ構文を使用: 例 'I'\''m Groot'（または可能なら二重引用符: "I'm Groot"）。

2. **スタイルガイドを読み込み**: `.specify/README.md` を読み込んで用語集とスタイルガイドを把握。
   - セクション見出しには規定の絵文字を使用する
   - 用語対応表に従って一貫した日本語表現を使用する
   - 英語維持する特殊文字列（マーカー、ステータス、ファイル名等）は変換しない

3. 実行されたスクリプトから、**tasks**へのパスを抽出。
4. 以下を実行してGitリモートを取得:

```bash
git config --get remote.origin.url
```

> [!CAUTION]
> リモートがGITHUB URLの場合にのみ次のステップに進む

5. リスト内の各タスクについて、GitHub MCPサーバーを使用して、Gitリモートを代表するリポジトリに新しいIssueを作成。

> [!CAUTION]
> リモートURLと一致しないリポジトリにIssueを作成することは絶対にしない
