package database

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Database struct {
	Pool *pgxpool.Pool
}

func NewDatabase(databaseURL string) (*Database, error) {
	pool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		return nil, fmt.Errorf("unable to create connection pool: %w", err)
	}

	// Test connection
	if err := pool.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("unable to ping database: %w", err)
	}

	return &Database{Pool: pool}, nil
}

func (db *Database) Close() {
	db.Pool.Close()
}

func (db *Database) RunMigrations(ctx context.Context) error {
	// Create users table
	_, err := db.Pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS users (
			id BIGSERIAL PRIMARY KEY,
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMP NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create users table: %w", err)
	}

	// Create videos table
	_, err = db.Pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS videos (
			id BIGSERIAL PRIMARY KEY,
			user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			title VARCHAR(255) NOT NULL,
			description TEXT,
			video_url VARCHAR(500),
			thumbnail_url VARCHAR(500),
			duration BIGINT NOT NULL DEFAULT 0,
			view_count BIGINT NOT NULL DEFAULT 0,
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMP NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create videos table: %w", err)
	}

	// Add duration column if it doesn't exist (migration for existing tables)
	_, err = db.Pool.Exec(ctx, `
		DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1 FROM information_schema.columns
				WHERE table_name='videos' AND column_name='duration'
			) THEN
				ALTER TABLE videos ADD COLUMN duration BIGINT NOT NULL DEFAULT 0;
			END IF;
		END $$;
	`)
	if err != nil {
		return fmt.Errorf("failed to add duration column: %w", err)
	}

	// Create index on user_id for videos
	_, err = db.Pool.Exec(ctx, `
		CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id)
	`)
	if err != nil {
		return fmt.Errorf("failed to create index: %w", err)
	}

	// Create profiles table
	_, err = db.Pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS profiles (
			id BIGSERIAL PRIMARY KEY,
			user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
			channel_name VARCHAR(255) NOT NULL DEFAULT '',
			description TEXT DEFAULT '',
			icon_url VARCHAR(500) DEFAULT '',
			banner_url VARCHAR(500) DEFAULT '',
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMP NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create profiles table: %w", err)
	}

	// Create index on user_id for profiles
	_, err = db.Pool.Exec(ctx, `
		CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id)
	`)
	if err != nil {
		return fmt.Errorf("failed to create index: %w", err)
	}

	// Create playlists table
	_, err = db.Pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS playlists (
			id BIGSERIAL PRIMARY KEY,
			user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			title VARCHAR(255) NOT NULL,
			description TEXT DEFAULT '',
			visibility VARCHAR(20) NOT NULL DEFAULT 'private',
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMP NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create playlists table: %w", err)
	}

	// Create index on user_id for playlists
	_, err = db.Pool.Exec(ctx, `
		CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id)
	`)
	if err != nil {
		return fmt.Errorf("failed to create playlists index: %w", err)
	}

	// Create playlist_videos table
	_, err = db.Pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS playlist_videos (
			id BIGSERIAL PRIMARY KEY,
			playlist_id BIGINT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
			video_id BIGINT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
			position INT NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			UNIQUE(playlist_id, video_id)
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create playlist_videos table: %w", err)
	}

	// Create index on playlist_id for playlist_videos
	_, err = db.Pool.Exec(ctx, `
		CREATE INDEX IF NOT EXISTS idx_playlist_videos_playlist_id ON playlist_videos(playlist_id)
	`)
	if err != nil {
		return fmt.Errorf("failed to create playlist_videos index: %w", err)
	}

	// Create subscriptions table
	_, err = db.Pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS subscriptions (
			id BIGSERIAL PRIMARY KEY,
			subscriber_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			subscribed_to_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			UNIQUE(subscriber_user_id, subscribed_to_user_id)
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create subscriptions table: %w", err)
	}

	// Create indexes for subscriptions
	_, err = db.Pool.Exec(ctx, `
		CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber ON subscriptions(subscriber_user_id)
	`)
	if err != nil {
		return fmt.Errorf("failed to create subscriptions subscriber index: %w", err)
	}

	_, err = db.Pool.Exec(ctx, `
		CREATE INDEX IF NOT EXISTS idx_subscriptions_subscribed_to ON subscriptions(subscribed_to_user_id)
	`)
	if err != nil {
		return fmt.Errorf("failed to create subscriptions subscribed_to index: %w", err)
	}

	// Create comments table
	_, err = db.Pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS comments (
			id BIGSERIAL PRIMARY KEY,
			video_id BIGINT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
			user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			parent_comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
			content TEXT NOT NULL,
			like_count BIGINT NOT NULL DEFAULT 0,
			is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
			is_creator_liked BOOLEAN NOT NULL DEFAULT FALSE,
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMP NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create comments table: %w", err)
	}

	// Create indexes for comments
	_, err = db.Pool.Exec(ctx, `
		CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id)
	`)
	if err != nil {
		return fmt.Errorf("failed to create comments video_id index: %w", err)
	}

	_, err = db.Pool.Exec(ctx, `
		CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id)
	`)
	if err != nil {
		return fmt.Errorf("failed to create comments user_id index: %w", err)
	}

	_, err = db.Pool.Exec(ctx, `
		CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id)
	`)
	if err != nil {
		return fmt.Errorf("failed to create comments parent_comment_id index: %w", err)
	}

	// Create comment_likes table
	_, err = db.Pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS comment_likes (
			id BIGSERIAL PRIMARY KEY,
			comment_id BIGINT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
			user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			like_type VARCHAR(10) NOT NULL CHECK (like_type IN ('like', 'dislike')),
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			UNIQUE(comment_id, user_id)
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create comment_likes table: %w", err)
	}

	// Create indexes for comment_likes
	_, err = db.Pool.Exec(ctx, `
		CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id)
	`)
	if err != nil {
		return fmt.Errorf("failed to create comment_likes comment_id index: %w", err)
	}

	_, err = db.Pool.Exec(ctx, `
		CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id)
	`)
	if err != nil {
		return fmt.Errorf("failed to create comment_likes user_id index: %w", err)
	}

	// Create watch_history table
	_, err = db.Pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS watch_history (
			id BIGSERIAL PRIMARY KEY,
			user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			video_id BIGINT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
			watched_at TIMESTAMP NOT NULL DEFAULT NOW(),
			UNIQUE(user_id, video_id)
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create watch_history table: %w", err)
	}

	// Create indexes for watch_history
	_, err = db.Pool.Exec(ctx, `
		CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id)
	`)
	if err != nil {
		return fmt.Errorf("failed to create watch_history user_id index: %w", err)
	}

	_, err = db.Pool.Exec(ctx, `
		CREATE INDEX IF NOT EXISTS idx_watch_history_watched_at ON watch_history(watched_at)
	`)
	if err != nil {
		return fmt.Errorf("failed to create watch_history watched_at index: %w", err)
	}

	return nil
}
