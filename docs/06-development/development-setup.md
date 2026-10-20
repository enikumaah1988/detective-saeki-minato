# 開発環境と起動

現行の起動入口はWindowsの[start-local.cmd](../../start-local.cmd)、Linuxの[start-local.sh](../../start-local.sh)。Node.jsとnpm、Git LFS対象の取得が必要。初回はnpm ciで依存導入する。依存更新後もnpm ciを再実行する。

既定は http://127.0.0.1:5187/ 。Ctrl+Cで停止。ポート使用中はstrictPortでエラー終了する。別ポートはWindowsで` .\start-local.cmd -Port 5197 `、Linuxで`sh ./start-local.sh 5197`。ローカルPC以外へ公開しない。停止・状態確認の新機能は#58の別課題。

手動起動は`npm run dev -- --port 5187 --strictPort`。通常はタイトルから開始し、開発サーバーの`?dev=1`だけDEVと本編直行を有効にする。

Windowsのこの作業領域に固有の[scenario-windows.ps1](../../tools/scenario-windows.ps1)は既存の固定ランタイムを使う補助手段。他環境共通の前提にしない。検証・CIは[検証手順](verification.md)を参照する。

## WSL環境の構築を選ぶ場合

以下は既存のWindows 11＋WSL2＋Ubuntu構築手順を保持したもの。現在のWindows直接起動にWSL導入は必須ではない。プレースホルダーや機器固有値をそのまま実行しない。環境の削除・再構築を今回の文書整理の作業手順とは扱わない。

# Development Environment Setup

## 目的

Windows 11 + WSL2 + Ubuntu を使って、個人開発用のローカル開発環境を構築する。

手順中の `<username>`、`<Your Name>`、`<your-email@example.com>`、`<repository-name>`、`<DistroName>` は、自分の環境に合わせて置き換える。

基本方針:

- VS Code は Windows 側で使用する
- ソースコード、Git、開発ツールは WSL / Ubuntu 側に配置する
- Git は開発開始時点から使用する
- Codex CLI 用に nvm と Node.js LTS / npm を導入する
- プロジェクトの実装に必要なランタイムは、技術スタック決定後に導入する
- GitHub やクラウド環境との接続は、ローカル開発環境が整ってから行う

---

## 1. 既存 WSL 環境の確認

Windows 側の PowerShell またはコマンドプロンプトで確認する。

```powershell
wsl --status
wsl --version
wsl -l -v
```

確認する項目:

- WSL のバージョン
- 既定の WSL バージョン
- インストール済みディストリビューション
- 各ディストリビューションが WSL1 / WSL2 のどちらで動作しているか
- 不要なディストリビューションが残っていないか

インストール可能なディストリビューションは以下で確認できる。

```powershell
wsl --list --online
```

---

## 2. 不要な WSL ディストリビューションの整理

現在のディストリビューションを確認する。

```powershell
wsl -l -v
```

不要なディストリビューションを削除する場合:

```powershell
wsl --unregister <DistroName>
```

### 注意

`--unregister` を実行すると、そのディストリビューション内の以下を含むデータが削除される。

- ホームディレクトリ
- ソースコード
- Git Repository
- パッケージ
- Linux 側設定ファイル
- SSH 設定
- 開発ツール設定

削除前に、必要なデータが残っていないことを確認する。

Docker Desktop などが管理する WSL ディストリビューションは、用途を確認せず削除しない。

---

## 3. Ubuntu のインストール

インストール可能な Ubuntu のバージョンを確認する。

```powershell
wsl --list --online
```

バージョンを固定してインストールする場合:

```powershell
wsl --install Ubuntu-<version>
```

例:

```powershell
wsl --install Ubuntu-26.04
```

バージョンを明示しない場合:

```powershell
wsl --install Ubuntu
```

長期間利用する開発環境では、ディストリビューション名にバージョンを含めて明示的にインストールしておくと管理しやすい。

---

## 4. UNIX ユーザーの作成

Ubuntu 初回起動時に UNIX ユーザーを作成する。

ユーザー名は以下を意識する。

- 小文字を基本とする
- スペースを使用しない
- 特定プロジェクト名に依存しすぎない
- 将来ほかの開発にも利用できる名前にする
- `root` や `admin` など紛らわしい名前は避ける

作成されたホームディレクトリ:

```text
/home/<username>
```

---

## 5. Ubuntu の基本状態確認

Ubuntu にログイン後、以下を確認する。

```bash
whoami
pwd
cat /etc/os-release
```

Git がプリインストールされているか確認する。

```bash
git --version
```

WSL のホームディレクトリを Windows 側のパスとして確認する場合:

```bash
wslpath -w ~
```

---

## 6. OS パッケージの更新

新規インストール後はパッケージ情報を更新する。

```bash
sudo apt update
```

インストール済みパッケージを更新する。

```bash
sudo apt upgrade -y
```

再度実行して更新対象がないことを確認してもよい。

```bash
sudo apt upgrade -y
```

---

## 7. systemd の状態確認

WSL 上で systemd が正常に起動しているか確認する。

```bash
ps -p 1 -o comm=
```

正常な場合:

```text
systemd
```

systemd 全体の状態確認:

```bash
systemctl is-system-running
```

失敗している Unit を確認する。

```bash
systemctl --failed
```

正常状態の目安:

```text
running
```

かつ:

```text
0 loaded units listed.
```

---

## 8. Ubuntu + WSL2 で systemd-binfmt.service が失敗する場合

環境によって、以下のようなエラーが発生する場合がある。

```text
systemd-binfmt.service failed
Failed to flush binfmt_misc rules, ignoring: Read-only file system
```

まず状態を確認する。

```bash
systemctl --failed
```

詳細確認:

```bash
systemctl status systemd-binfmt.service --no-pager
```

WSL 上で `systemd-binfmt.service` を起動しないよう override を追加する場合:

```bash
sudo mkdir -p /etc/systemd/system/systemd-binfmt.service.d
```

```bash
printf '[Unit]\nConditionVirtualization=!wsl\n' \
  | sudo tee /etc/systemd/system/systemd-binfmt.service.d/override.conf
```

設定内容を確認する。

```bash
cat /etc/systemd/system/systemd-binfmt.service.d/override.conf
```

想定内容:

```ini
[Unit]
ConditionVirtualization=!wsl
```

systemd の設定を再読込する。

```bash
sudo systemctl daemon-reload
```

Ubuntu を終了する。

```bash
exit
```

Windows 側で WSL を完全停止する。

```powershell
wsl --shutdown
```

再度 Ubuntu を起動する。

```powershell
wsl -d <DistroName>
```

再確認:

```bash
systemctl is-system-running
systemctl --failed
```

### 補足

`wsl --shutdown` は Windows 側のコマンドである。

Ubuntu シェル内ではなく、PowerShell またはコマンドプロンプトから実行する。

---

## 9. VS Code + WSL 接続

VS Code は Windows 側にインストールする。

WSL 側の対象ディレクトリから以下を実行する。

```bash
code .
```

初回接続時、または VS Code のバージョン更新時には、WSL 側へ VS Code Server がインストールまたは更新されることがある。

通常、`code .` を実行するたびに再ダウンロードされるわけではない。

WSL 側では以下のようなディレクトリが作成される。

```text
~/.vscode-server/
```

---

## 10. Git 初期設定

現在の設定を確認する。

```bash
git config --global --list
```

未設定の場合、`.gitconfig` が存在しないというエラーが出ることがある。

Git のユーザー名を設定する。

```bash
git config --global user.name "<Your Name>"
```

メールアドレスを設定する。

```bash
git config --global user.email "<your-email@example.com>"
```

新規 Repository のデフォルトブランチを `main` にする。

```bash
git config --global init.defaultBranch main
```

設定確認:

```bash
git config --global --list
```

GitHub を利用する予定がある場合、`user.email` は GitHub アカウントに登録されているメールアドレスを使用するとコミットを紐付けやすい。

---

## 11. Workspace の作成

Linux 側のホームディレクトリ配下に、開発用 Workspace を作成する。

```bash
mkdir -p ~/workspace
```

プロジェクト用ディレクトリを作成する。

```bash
mkdir -p ~/workspace/<repository-name>
```

移動:

```bash
cd ~/workspace/<repository-name>
```

確認:

```bash
pwd
```

ソースコードは原則として `/mnt/c/...` ではなく、WSL 側の Linux ファイルシステム上に配置する。

例:

```text
/home/<username>/workspace/<repository-name>
```

---

## 12. ローカル Git Repository の作成

プロジェクトディレクトリで Git Repository を初期化する。

```bash
git init
```

確認:

```bash
git status
```

正常な例:

```text
On branch main

No commits yet
```

---

## 13. 初期ファイルとドキュメント領域の作成

最低限の初期ファイルを作成する。

```bash
touch README.md
mkdir -p docs
```

開発環境構築手順をプロジェクト内に残す場合:

```bash
touch docs/06-development/development-setup.md
```

初期構成例:

```text
<repository-name>/
├── .git/
├── README.md
└── docs/
    └── development-setup.md
```

VS Code で開く。

```bash
code .
```

---

## 14. nvm・Node.js LTS・Codex CLI の導入

以下は WSL / Ubuntu 側の Bash で実行する。

### 14.1. nvm の導入

nvm が既に読み込まれているか確認する。

```bash
command -v nvm
```

`nvm` と表示されれば利用できる。表示されない場合は、既存の導入状況を確認し、未導入なら nvm v0.40.8 をインストールする。

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
```

Bash の設定を再読込する。

```bash
source ~/.bashrc
```

導入結果を確認する。

```bash
command -v nvm
nvm --version
```

新規導入した場合、バージョンが `0.40.8` と表示されることを確認する。

### 14.2. Node.js LTS の導入

利用可能な LTS バージョンを確認する。

```bash
nvm ls-remote --lts
```

Node.js LTS をインストールする。npm も同時に導入される。

```bash
nvm install --lts
```

現在使用しているバージョンを確認する。

```bash
node --version
npm --version
nvm current
```

Node.js は Codex CLI を利用するための開発ツールとして導入する。プロジェクトの実装技術として採用するかどうかは、別途決定する。

### 14.3. Codex CLI の導入

npm で Codex CLI をインストールする。

```bash
npm install -g @openai/codex@latest
```

導入結果を確認する。

```bash
codex --version
```

参考: [Codex CLI 公式ドキュメント](https://learn.chatgpt.com/docs/codex/cli)

### 14.4. Codex CLI の初回起動

Git Repository のルートへ移動し、場所を確認してから起動する。

```bash
cd ~/workspace/<repository-name>
pwd
git rev-parse --show-toplevel
codex
```

初回起動時に認証を求められた場合は、画面の案内に従う。

`Folder Access` が表示されたら、対象が信頼できる自分のリポジトリであることを確認し、`Trust and continue` を選択する。

Codex が対象リポジトリを作業ディレクトリとして認識していることを確認する。読み取り確認の例として、以下を依頼する。

```text
このリポジトリの現在の構成を確認して、
README.md と docs/06-development/development-setup.md が存在することを教えて。
ファイルは変更しないで。
```

対象のファイルを確認できれば、Codex からリポジトリへアクセスできている。

---

## 15. 技術スタックの決定

Node.js、Python、Java などのランタイムは、WSL 初期構築時にまとめてインストールしない。

Codex CLI 用に導入した Node.js / npm とは別に、プロジェクトで採用する技術スタックを決定してから、実装に必要なものだけ導入する。

例:

```text
Frontend
Backend
Game / ADV Framework
Build Tool
Package Manager
Test Framework
```

これにより、不要なランタイムやバージョン管理ツールが増えることを避ける。

現在のフロントエンドは React + TypeScript + Vite、パッケージマネージャは npm を採用している。Backend と API 通信処理は未実装である。

---

## 16. `.gitignore` の作成

`.gitignore` は技術スタック決定後に作成する。

理由:

- Node.js
- Python
- Java
- ゲームエンジン
- IDE

などによって除外対象が異なるため。

現在は `.gitignore` を作成済みで、`node_modules/`、`dist/`、環境変数ファイル、ログなどを除外している。再現時はリポジトリに含まれる設定を使用する。

```bash
touch .gitignore
```

---

## 17. README の初期作成

開発準備の段階では、プロジェクト名と概要を記載する。技術スタックが未確定の間は、実装技術について記載しない。

技術スタックの決定や実装の進行に合わせて、セットアップ方法、ディレクトリ構成、実行方法などを追記する。

---

## 18. 初回コミット

初期構成が決まった段階で確認する。

```bash
git status
```

ステージング:

```bash
git add .
```

コミット:

```bash
git commit -m "chore: initialize development environment"
```

確認:

```bash
git log --oneline
```

---

## 19. GitHub との接続

ローカル開発環境が安定してから GitHub Repository を作成する。

ローカル Repository と GitHub を接続し、`origin` を設定する。

GitHub 接続はローカル開発環境構築とは分離して考える。

---

## 20. 現在の到達点と今後の作業

### 現在の到達点

ここまでの環境構築で、以下が完了した状態を到達点とする。他の環境で再利用する際は、それぞれの手順で結果を確認する。

- WSL2 / Ubuntu が正常動作している
- `apt update` / `apt upgrade` による OS パッケージの更新が完了している
- systemd が正常動作し、失敗している Unit がない
- VS Code から WSL へ接続できる
- Git が使用でき、初期設定が完了している
- `~/workspace/<repository-name>` とローカル Git Repository が作成されている
- README / docs が作成され、README に概要が記載されている
- nvm が利用できる
- Node.js LTS / npm が利用できる
- Codex CLI が導入され、初回起動が完了している
- Codex が対象リポジトリを作業ディレクトリとして認識し、ファイルへアクセスできる
- 初回コミットが完了している
- React + TypeScript + Vite の開発基盤と `.gitignore` が用意されている
- 開発サーバーの起動と本番用ビルドを確認している

### 今後の作業

ゲーム機能の実装に向けて、以下を検討する。

- ストーリー表示やシナリオデータの仕様
- 必要になった段階でのルーティングや状態管理
- Android / iOS 展開方法
- Backend API の仕様と連携方法
- 必要に応じた GitHub / クラウド環境との接続

---

## 21. フロントエンド開発環境の再現

React + TypeScript + Vite の構成は Repository 直下に導入済みである。既存の Git Repository と docs を使用し、再現時に `git init` や Vite のテンプレート生成を実行する必要はない。

### 21.1. 作業ディレクトリと前提環境の確認

以下はすべて WSL / Ubuntu のターミナルで実行する。`<repository-name>` は取得済みリポジトリのディレクトリ名に置き換える。

```bash
cd ~/workspace/<repository-name>
pwd
git rev-parse --show-toplevel
node --version
npm --version
```

`pwd` と Git のルートが一致することを確認する。Node.js は LTS を使用し、Vite の要件（Node.js 20.19 以上の 20 系、または 22.12 以上）を満たすことを確認する。

### 21.2. 依存パッケージのインストール

Repository 内の `package-lock.json` に合わせてインストールする。

```bash
npm ci
```

依存関係を意図的に変更する場合は `package.json` を更新し、`npm install` でロックファイルも更新する。

### 21.3. 開発サーバーの起動確認

リポジトリのルートから実行する。

```bash
npm run dev
```

ターミナルに表示される Local URL を Windows 側のブラウザーで開く。「探偵 佐伯湊」と「Detective Saeki Minato」が表示されることを確認する。終了時はターミナルで `Ctrl+C` を押す。

### 21.4. ビルド確認

同じリポジトリのルートで実行する。

```bash
npm run build
```

TypeScript の型チェックと Vite のビルドが成功し、`dist/` が生成されることを確認する。`dist/` と `node_modules/` は Git 管理対象外である。

必要に応じて、ビルド成果物をローカルで確認する。

```bash
npm run preview
```

ディレクトリの用途や今後の展開方針は [README](../../README.md) を参照する。
