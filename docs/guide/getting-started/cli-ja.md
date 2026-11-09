# CLI クイックスタート

コマンドラインから 牛马Agent を使い始めます。

[English](./cli) | [简体中文](./cli-zh) | 日本語

## 始める前に

[インストールガイド](./#installation)に従って 牛马Agent をインストールしてください。
この手順では Claude Code を使います。Claude Code の CLI をインストールし、
ログインを済ませておいてください。プロジェクトの信頼確認を求められた場合は、
事前にプロジェクトで済ませるか、起動後にエージェントのターミナルで応答できます（ステップ 4）。
設定済みの[別の対応ランタイム](../runtimes)を使うこともできます。

ターミナルで 牛马Agent を実行できることを確認します。

```bash
niuma-agent --version
niuma-agent doctor
```

`doctor` はインストール状況、検出したランタイム、daemon の状態を表示します。
ランタイムの検出は、プロバイダーへのログイン確認ではありません。
この時点では daemon が停止していても問題ありません。次の手順で起動します。

## ステップ 1: daemon を起動

```bash
niuma-agent daemon start
niuma-agent daemon status
```

互換性のある daemon が起動済みなら、`daemon start` はそれを利用します。
`attach`、`actor`、`send` などのコマンドには、起動中の daemon が必要です。

## ステップ 2: 作業グループを作成

```bash
cd /path/to/your/project
niuma-agent attach .
```

新しいグループを作成し、現在のディレクトリをプロジェクトの作業場所
（「スコープ」）として関連付け、そのグループをアクティブにします。
出力には `group_id` が含まれます。既存のグループに戻るには、`niuma-agent groups` と
`niuma-agent use <group_id>` を使ってください。`niuma-agent attach .` を再実行すると、別のグループが作成されます。

画面では、エージェントランタイムで動く、またはエージェントランタイムに接続したメンバーをエージェントと呼びます。CLI では引き続き `niuma-agent actor`
コマンドと `actor_id` などのフィールドを使います。グループに対応する
コマンドやフィールドの名前も、`niuma-agent group` や `group_id` のままです。

## ステップ 3: 最初のエージェントを追加

```bash
niuma-agent actor add assistant --runtime claude
```

グループのメンバー一覧で最初の内部用ではないエージェントが「foreman」（調整役）です。
そのエージェントを無効にしても、別のメンバーが自動的に foreman になることはありません。

この Claude Code セッションでは、牛马Agent が起動時に 牛马Agent MCP 連携を設定するため、
別途 `niuma-agent setup` を実行する必要はありません。他のランタイムでは設定が必要な場合があります。
詳しくは[対応ランタイム](../runtimes)と
[`niuma-agent setup`](/reference/cli#niuma-setup)を参照してください。

## ステップ 4: エージェントを起動

```bash
niuma-agent group start
```

`group start` はグループ内の有効なエージェントを起動します。特定のエージェントだけを起動する場合は、次を使います。

```bash
niuma-agent actor start assistant
```

`niuma-agent actor list` で状態を確認できます。起動時に対話操作が必要な場合は、
[Web UI](#web-ui-を起動-任意)でそのエージェントのターミナルを開いてください。

## ステップ 5: メッセージを送信

```bash
niuma-agent send "こんにちは。自己紹介をお願いします。" --to assistant
```

## ステップ 6: 応答を確認

グループに記録されたメッセージやその他のイベントを JSON で追跡します。

```bash
niuma-agent tail -f
```

エージェントからの `chat.message` イベントを確認してください。
ネイティブターミナルの出力は Web UI で確認できます。
**Ctrl+C** で追跡を終了しても、エージェントは動き続けます。

`niuma-agent inbox` は、エージェントの未読 Mail を読み取り、**既読として消費する**コマンドです。
応答の確認には `tail` または Web のチャットを使ってください。

## エージェントを追加

Codex のインストールとログインが済んでいれば、2 番目のエージェントを追加できます。

```bash
niuma-agent actor add reviewer --runtime codex
niuma-agent actor start reviewer
```

宛先を指定してメッセージを送信します。

```bash
niuma-agent send "機能を実装してください" --to assistant
niuma-agent send "コードをレビューしてください" --to reviewer
niuma-agent send "次の作業を調整してください" --to "@foreman"
niuma-agent send "チーム全体への指示: CI が通るまでデプロイを保留してください" --to "@all"
```

会話の切り替え後も担当者・成果・検証結果を追跡したい作業には、`tracked-send` を使います。

```bash
niuma-agent tracked-send "機能を実装し、検証結果を添えて返信してください。" \
  --to assistant \
  --title "機能の実装" \
  --outcome "実装が完了し、検証結果が報告されている"
```

この複数行の例は Bash の行継続を使っています。PowerShell では 1 行で入力してください。

## メッセージに返信

`<event_id>` を、`tail` に表示された返信先メッセージの `id` に置き換えます。

```bash
niuma-agent reply <event_id> "ありがとうございます。その内容でお願いします。"
niuma-agent reply <event_id> "急ぎではない補足です" --to assistant --mode mail
```

Mail はエージェント宛てに使い、受信したエージェントを即座に起動・実行させません。

## グループと送信者の選択 {#group-と送信者の選択}

`--group` を受け付けるコマンドは、明示的なオプション → `NIUMA_GROUP_ID` 環境変数 →
`attach` または `niuma-agent use` で選択したアクティブなグループの順に対象を決定します。
ディレクトリを移動するだけではグループは切り替わりません。
送信者は `--by` → `NIUMA_ACTOR_ID` → `user` の順に決定します。
別のセッションがアクティブなグループを切り替えても、エージェントは自分のグループを保持します。

## よく使うコマンド

別のインスタンスに送信する場合は、`niuma-agent connect` でアクセス可能なグループを調べ、
`niuma-agent send --dst-instance ... --dst-group ...` を使います。
返信には、受信したメッセージのローカルイベント ID を使ってください。
Direct 接続を含む手順は[エージェント間の連携](../connect.md#agent-collaboration)を参照してください。

### グループの管理 {#group-の管理}

```bash
niuma-agent groups                # 全グループを表示
niuma-agent use <group_id>        # 対象のグループを選択
niuma-agent active                # アクティブなグループを表示
niuma-agent group show <group_id> # グループの情報を表示
niuma-agent group start           # このグループの有効なエージェントを起動
niuma-agent group stop            # このグループのエージェントを停止し、履歴は保持
```

### エージェントの管理 {#actor-の管理}

```bash
niuma-agent actor list                  # エージェントを一覧表示
niuma-agent actor add <id> --runtime <r> # エージェントを追加
niuma-agent actor start <id>            # エージェントを起動
niuma-agent actor stop <id>             # エージェントを停止
niuma-agent actor restart <id>          # エージェントを再起動
niuma-agent actor remove <id>           # エージェントを削除
```

### メッセージ

```bash
niuma-agent send "メッセージ"             # --to なし: 既定の宛先ポリシーを使用（初期値は foreman）
niuma-agent send "メッセージ" --to assistant # 特定のエージェントに送信
niuma-agent send "メッセージ" --to "@foreman"  # 調整役に送信
niuma-agent send "メッセージ" --to "@all"      # 明示的な全員送信。通常のタスク割り当てとは別
niuma-agent tracked-send "作業内容" --to assistant --title "タスク名" --outcome "完了条件"
niuma-agent reply <event_id> "応答"       # メッセージに返信
niuma-agent inbox --actor-id assistant   # エージェントの未読 Mail を読み取り、既読として消費
niuma-agent tail -n 50                   # 最近のイベントを表示
niuma-agent tail -f                      # 新しいイベントを追跡
```

### daemon の操作

```bash
niuma-agent daemon status # 状態を確認
niuma-agent daemon start  # 起動
niuma-agent daemon stop   # daemon と、各グループの管理対象プロセスを停止
```

## Web UI を起動（任意） {#web-ui-を起動-任意}

別のターミナルで Web UI を起動します。

```bash
niuma-agent web
```

サブコマンドなしの `niuma-agent` も同じサービスを起動し、対話的なターミナルではこの起動用の
ステータスパネルも開きます。`niuma-agent --headless` は `niuma-agent web` と同じです。どちらも起動済みの
daemon を利用し、必要なら起動します。既定の設定では http://127.0.0.1:8848/ を開いてください。
アドレスやポートを変更している場合は、起動時に表示される URL を使います。
別のポートを指定するには `niuma-agent web --port 9000` を使います。

## 環境変数

| 変数 | 既定値 | 説明 |
|------|--------|------|
| `NIUMA_HOME` | `~/.niuma-agent` | ランタイムデータの保存先 |
| `NIUMA_WEB_PORT` | `8848` | 保存済みの設定や `--port` が優先されない場合の Web UI ポート |

同じグループやランタイム状態を使うコマンドでは、同じ `NIUMA_HOME` を指定してください。
Web のアドレス・ポート設定と優先順位は[CLI リファレンス](/reference/cli#environment-variables)を参照してください。

## 作業を終える

**Ctrl+C** で `tail -f` を終了した後、現在のグループのエージェントを停止します。

```bash
niuma-agent group stop
```

グループと記録済みの履歴は残ります。`niuma-agent group start` でエージェントを再び起動できます。
他のグループの管理対象プロセスも含めてインスタンス全体を停止する場合は、`niuma-agent daemon stop` を使います。

## トラブルシューティング

### daemon が起動しない

```bash
niuma-agent daemon status
niuma-agent doctor
```

停止している場合は `niuma-agent daemon start` を実行してください。
応答しない場合は、表示されたエラーを確認してから停止・再起動を判断してください。
daemon の再起動は、各グループの管理対象プロセスを中断します。

### エージェントが応答しない

```bash
# エージェントの状態を確認
niuma-agent actor list

# 記録されたエラーやメッセージを確認
niuma-agent tail -n 50
```

Web UI のエージェントのターミナルで、ログイン・信頼確認・承認待ちを確認してください。
[ランタイム連携](../runtimes)も確認します。原因を解消した後、
`niuma-agent actor start <actor_id>` で起動するか、必要なら
`niuma-agent actor restart <actor_id>` で再起動してください。

### グループが見つからない {#group-が見つからない}

```bash
# 全グループを表示
niuma-agent groups

# 既存のグループを選択
niuma-agent use <group_id>
niuma-agent active
```

ターミナルが想定どおりの `NIUMA_HOME` を使っているか確認してください。
`attach` は、新しいグループを作る場合、または対象を明示して既存のグループにスコープを追加する場合に使います。

## 次のステップ

以下の関連ガイドは英語です。

- [ワークフロー](/guide/workflows) — 連携の進め方
- [CLI リファレンス](/reference/cli) — コマンドの詳細
- [IM ブリッジ](/guide/im-bridge/) — モバイルからのアクセス
