# Video Platform Backend API

Go製の動画共有プラットフォームのバックエンドAPI

## 技術スタック

- **言語**: Go 1.22
- **フレームワーク**: Gin
- **データベース**: PostgreSQL
- **認証**: JWT
- **開発環境**: Docker + Air (ホットリロード)

## セットアップ

### 環境変数

`.env`ファイルを作成：

```bash
cp .env.example .env
```

### Dockerで起動

```bash
# プロジェクトルートから実行
docker-compose up -d

# ログ確認
docker-compose logs -f backend
```

バックエンドは `http://localhost:8080` で起動します。

### ローカルで起動（Dockerなし）

```bash
# PostgreSQLが別途起動している必要があります
go run cmd/api/main.go
```

## API エンドポイント

### ヘルスチェック

```
GET /health
```

### 認証

#### ユーザー登録

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### ログイン

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### ログアウト

```
POST /api/auth/logout
```

### 動画

#### 動画一覧取得

```
GET /api/videos
```

**レスポンス:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "title": "サンプル動画",
    "description": "説明文",
    "video_url": "https://example.com/video.mp4",
    "thumbnail_url": "https://example.com/thumb.jpg",
    "view_count": 100,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### 動画詳細取得

```
GET /api/videos/:id
```

#### 動画作成（要認証）

```
POST /api/videos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "動画タイトル",
  "description": "動画の説明",
  "video_url": "https://example.com/video.mp4",
  "thumbnail_url": "https://example.com/thumb.jpg"
}
```

#### 動画更新（要認証）

```
PUT /api/videos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "更新されたタイトル",
  "description": "更新された説明"
}
```

#### 動画削除（要認証）

```
DELETE /api/videos/:id
Authorization: Bearer <token>
```

## ディレクトリ構成

```
backend/
├── cmd/
│   └── api/
│       └── main.go           # エントリーポイント
├── internal/
│   ├── database/
│   │   └── database.go       # DB接続・マイグレーション
│   ├── handler/
│   │   ├── auth_handler.go   # 認証ハンドラー
│   │   └── video_handler.go  # 動画ハンドラー
│   ├── middleware/
│   │   └── auth_middleware.go # 認証ミドルウェア
│   ├── model/
│   │   ├── user.go           # Userモデル
│   │   └── video.go          # Videoモデル
│   ├── repository/
│   │   ├── user_repository.go
│   │   └── video_repository.go
│   └── service/
│       ├── auth_service.go
│       └── video_service.go
├── Dockerfile
├── .air.toml                 # ホットリロード設定
└── .env.example
```

## 開発

### ホットリロード

Dockerコンテナ内でAirが自動的にコード変更を検知してリロードします。

### マイグレーション

マイグレーションはアプリケーション起動時に自動実行されます（`internal/database/database.go`）。

## テスト

```bash
# curlでテスト
# 登録
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# ログイン
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 動画作成（<TOKEN>は上記で取得したトークン）
curl -X POST http://localhost:8080/api/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"テスト動画","description":"説明文"}'

# 動画一覧取得
curl http://localhost:8080/api/videos
```
