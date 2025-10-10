# Heroku デプロイ手順

## 前提条件

- Heroku CLI がインストールされていること
- GCP アカウントがあること
- Git がインストールされていること

## 1. GCP Cloud Storage のセットアップ

### 1.1 GCP プロジェクト作成
1. [GCP Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成

### 1.2 Cloud Storage バケット作成
1. GCP Console で「Cloud Storage」→「バケット」に移動
2. 「バケットを作成」をクリック
3. バケット名を入力（例: `youtube-clone-videos`）
4. ロケーション: `asia-northeast1`（東京）を推奨
5. ストレージクラス: `Standard`
6. アクセス制御: `均一`
7. 「作成」をクリック

### 1.3 サービスアカウント作成
1. GCP Console で「IAM と管理」→「サービスアカウント」に移動
2. 「サービスアカウントを作成」をクリック
3. 名前: `youtube-clone-storage`
4. 役割: `Storage Object Admin`（日本語: Storage オブジェクト管理者）
5. 「完了」をクリック
6. 作成したサービスアカウントをクリック
7. 「キー」タブ → 「鍵を追加」→「新しい鍵を作成」
8. JSON 形式を選択してダウンロード（このファイルは後で使用）

### 1.4 バケットを公開アクセス可能に設定
1. バケットの「権限」タブに移動
2. 「アクセス権を付与」をクリック
3. 新しいプリンシパル: `allUsers`
4. 役割: `Storage Object Viewer`（日本語: Storage オブジェクト閲覧者）
5. 「保存」をクリック

## 2. Heroku アプリケーション作成

```bash
# Heroku にログイン
heroku login

# backend ディレクトリに移動
cd backend

# Heroku アプリケーションを作成
heroku create your-app-name

# スタックをコンテナに設定
heroku stack:set container -a your-app-name

# Heroku Postgres アドオンを追加
heroku addons:create heroku-postgresql:mini -a your-app-name
```

## 3. 環境変数の設定

### 3.1 GCP 認証情報の設定

ダウンロードした JSON ファイルの内容を Base64 エンコードします：

```bash
# macOS/Linux
cat path/to/service-account-key.json | base64

# または直接 Heroku に設定
heroku config:set GCP_CREDENTIALS="$(cat path/to/service-account-key.json | base64)" -a your-app-name
```

### 3.2 必要な環境変数を設定

```bash
# JWT Secret
heroku config:set JWT_SECRET="your-random-secret-key-here" -a your-app-name

# GCP プロジェクト ID
heroku config:set GCP_PROJECT_ID="your-gcp-project-id" -a your-app-name

# GCP バケット名
heroku config:set GCP_BUCKET_NAME="youtube-clone-videos" -a your-app-name

# CORS 許可オリジン（Vercel のフロントエンド URL）
heroku config:set ALLOWED_ORIGINS="https://your-frontend.vercel.app,http://localhost:3000" -a your-app-name

# PORT（Heroku が自動設定するが念のため）
heroku config:set PORT="8080" -a your-app-name
```

### 3.3 DATABASE_URL の確認

Heroku Postgres アドオンを追加すると自動的に `DATABASE_URL` が設定されます。確認：

```bash
heroku config:get DATABASE_URL -a your-app-name
```

## 4. デプロイ

### 4.1 Git の準備

```bash
# backend ディレクトリで Git リポジトリを初期化（まだの場合）
git init

# Heroku リモートを追加（アプリ作成時に自動で追加されているはず）
heroku git:remote -a your-app-name

# ファイルをステージング
git add .
git commit -m "Initial deployment"
```

### 4.2 デプロイ実行

```bash
# Heroku にプッシュ
git push heroku main

# または別のブランチからデプロイする場合
git push heroku your-branch:main
```

### 4.3 ログの確認

```bash
# デプロイログを確認
heroku logs --tail -a your-app-name
```

## 5. 動作確認

### 5.1 ヘルスチェック

```bash
curl https://your-app-name.herokuapp.com/health
```

レスポンス:
```json
{"status":"ok"}
```

### 5.2 フロントエンドの設定更新

Vercel のフロントエンド環境変数を更新：

```
NEXT_PUBLIC_API_URL=https://your-app-name.herokuapp.com
```

## 6. トラブルシューティング

### ログの確認
```bash
heroku logs --tail -a your-app-name
```

### アプリケーションの再起動
```bash
heroku restart -a your-app-name
```

### データベースのリセット（注意：全データ削除）
```bash
heroku pg:reset DATABASE_URL -a your-app-name --confirm your-app-name
heroku restart -a your-app-name
```

### 環境変数の一覧表示
```bash
heroku config -a your-app-name
```

## 7. コード修正が必要な箇所

現在のコードは MinIO を使用しているため、GCP Cloud Storage に対応するためにコード修正が必要です。

### オプション A: MinIO SDK で GCP に接続（簡単）

GCP Cloud Storage は S3 互換 API をサポートしているため、環境変数を変更するだけで動作します：

```bash
# MinIO の代わりに GCP のエンドポイントを設定
MINIO_ENDPOINT=storage.googleapis.com
MINIO_PUBLIC_ENDPOINT=https://storage.googleapis.com/your-bucket-name
MINIO_ACCESS_KEY=your-gcp-access-key
MINIO_SECRET_KEY=your-gcp-secret-key
MINIO_BUCKET=your-bucket-name
MINIO_USE_SSL=true
```

ただし、この方法は推奨されません。GCP の公式 SDK を使う方が安定しています。

### オプション B: GCP SDK に移行（推奨）

`internal/storage/minio.go` を GCP Cloud Storage SDK に置き換える必要があります。
これについては別途実装が必要です。

## まとめ

1. GCP でバケットとサービスアカウントを作成
2. Heroku アプリを作成してスタックを container に設定
3. 環境変数を設定
4. `git push heroku main` でデプロイ
5. フロントエンドの API URL を更新

デプロイが完了したら、Vercel のフロントエンドから Heroku のバックエンドに接続できるようになります！
