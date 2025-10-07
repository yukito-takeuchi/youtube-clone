package repository

import (
	"context"
	"fmt"

	"github.com/yukito/video-platform/internal/database"
	"github.com/yukito/video-platform/internal/model"
)

type VideoRepository struct {
	db *database.Database
}

func NewVideoRepository(db *database.Database) *VideoRepository {
	return &VideoRepository{db: db}
}

func (r *VideoRepository) Create(ctx context.Context, video *model.Video) (*model.Video, error) {
	err := r.db.Pool.QueryRow(ctx, `
		INSERT INTO videos (user_id, title, description, video_url, thumbnail_url, view_count)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, user_id, title, description, video_url, thumbnail_url, view_count, created_at, updated_at
	`, video.UserID, video.Title, video.Description, video.VideoURL, video.ThumbnailURL, video.ViewCount).Scan(
		&video.ID,
		&video.UserID,
		&video.Title,
		&video.Description,
		&video.VideoURL,
		&video.ThumbnailURL,
		&video.ViewCount,
		&video.CreatedAt,
		&video.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create video: %w", err)
	}
	return video, nil
}

func (r *VideoRepository) FindByID(ctx context.Context, id int64) (*model.Video, error) {
	video := &model.Video{}
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, user_id, title, description, video_url, thumbnail_url, view_count, created_at, updated_at
		FROM videos
		WHERE id = $1
	`, id).Scan(
		&video.ID,
		&video.UserID,
		&video.Title,
		&video.Description,
		&video.VideoURL,
		&video.ThumbnailURL,
		&video.ViewCount,
		&video.CreatedAt,
		&video.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to find video: %w", err)
	}
	return video, nil
}

func (r *VideoRepository) FindAll(ctx context.Context) ([]*model.Video, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT id, user_id, title, description, video_url, thumbnail_url, view_count, created_at, updated_at
		FROM videos
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to find videos: %w", err)
	}
	defer rows.Close()

	videos := []*model.Video{}
	for rows.Next() {
		video := &model.Video{}
		err := rows.Scan(
			&video.ID,
			&video.UserID,
			&video.Title,
			&video.Description,
			&video.VideoURL,
			&video.ThumbnailURL,
			&video.ViewCount,
			&video.CreatedAt,
			&video.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan video: %w", err)
		}
		videos = append(videos, video)
	}

	return videos, nil
}

func (r *VideoRepository) Update(ctx context.Context, video *model.Video) (*model.Video, error) {
	err := r.db.Pool.QueryRow(ctx, `
		UPDATE videos
		SET title = $1, description = $2, video_url = $3, thumbnail_url = $4, updated_at = NOW()
		WHERE id = $5
		RETURNING id, user_id, title, description, video_url, thumbnail_url, view_count, created_at, updated_at
	`, video.Title, video.Description, video.VideoURL, video.ThumbnailURL, video.ID).Scan(
		&video.ID,
		&video.UserID,
		&video.Title,
		&video.Description,
		&video.VideoURL,
		&video.ThumbnailURL,
		&video.ViewCount,
		&video.CreatedAt,
		&video.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update video: %w", err)
	}
	return video, nil
}

func (r *VideoRepository) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Pool.Exec(ctx, `
		DELETE FROM videos WHERE id = $1
	`, id)
	if err != nil {
		return fmt.Errorf("failed to delete video: %w", err)
	}
	return nil
}

func (r *VideoRepository) IncrementViewCount(ctx context.Context, id int64) error {
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE videos SET view_count = view_count + 1 WHERE id = $1
	`, id)
	if err != nil {
		return fmt.Errorf("failed to increment view count: %w", err)
	}
	return nil
}
