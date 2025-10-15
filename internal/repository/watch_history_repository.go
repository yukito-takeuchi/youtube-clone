package repository

import (
	"context"
	"fmt"

	"github.com/yukito/video-platform/internal/database"
	"github.com/yukito/video-platform/internal/model"
)

type WatchHistoryRepository struct {
	db *database.Database
}

func NewWatchHistoryRepository(db *database.Database) *WatchHistoryRepository {
	return &WatchHistoryRepository{db: db}
}

// AddToHistory adds or updates a video in user's watch history
func (r *WatchHistoryRepository) AddToHistory(ctx context.Context, userID, videoID int64) error {
	query := `
		INSERT INTO watch_history (user_id, video_id, watched_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (user_id, video_id)
		DO UPDATE SET watched_at = NOW()
	`
	_, err := r.db.Pool.Exec(ctx, query, userID, videoID)
	if err != nil {
		return fmt.Errorf("failed to add to history: %w", err)
	}
	return nil
}

// GetWatchHistory returns user's watch history with pagination
func (r *WatchHistoryRepository) GetWatchHistory(ctx context.Context, userID int64, limit, offset int) ([]*model.WatchHistory, error) {
	query := `
		SELECT 
			wh.id, wh.user_id, wh.video_id, wh.watched_at,
			v.id, v.user_id, v.title, v.description, v.video_url, v.thumbnail_url, v.duration, v.view_count, v.created_at, v.updated_at,
			p.id, p.user_id, p.channel_name, p.description, p.icon_url, p.banner_url, p.created_at, p.updated_at
		FROM watch_history wh
		JOIN videos v ON wh.video_id = v.id
		LEFT JOIN profiles p ON v.user_id = p.user_id
		WHERE wh.user_id = $1
		ORDER BY wh.watched_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Pool.Query(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get watch history: %w", err)
	}
	defer rows.Close()

	var history []*model.WatchHistory
	for rows.Next() {
		var h model.WatchHistory
		var video model.VideoWithProfile
		var profile model.Profile

		err := rows.Scan(
			&h.ID, &h.UserID, &h.VideoID, &h.WatchedAt,
			&video.ID, &video.UserID, &video.Title, &video.Description,
			&video.VideoURL, &video.ThumbnailURL, &video.Duration, &video.ViewCount,
			&video.CreatedAt, &video.UpdatedAt,
			&profile.ID, &profile.UserID, &profile.ChannelName, &profile.Description,
			&profile.IconURL, &profile.BannerURL, &profile.CreatedAt, &profile.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan watch history: %w", err)
		}

		video.Profile = &profile
		h.Video = &video
		history = append(history, &h)
	}

	return history, nil
}

// RemoveFromHistory removes a specific video from user's watch history
func (r *WatchHistoryRepository) RemoveFromHistory(ctx context.Context, userID, videoID int64) error {
	query := `DELETE FROM watch_history WHERE user_id = $1 AND video_id = $2`
	_, err := r.db.Pool.Exec(ctx, query, userID, videoID)
	if err != nil {
		return fmt.Errorf("failed to remove from history: %w", err)
	}
	return nil
}

// ClearHistory removes all watch history for a user
func (r *WatchHistoryRepository) ClearHistory(ctx context.Context, userID int64) error {
	query := `DELETE FROM watch_history WHERE user_id = $1`
	_, err := r.db.Pool.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to clear history: %w", err)
	}
	return nil
}

// GetHistoryCount returns the total number of videos in user's watch history
func (r *WatchHistoryRepository) GetHistoryCount(ctx context.Context, userID int64) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM watch_history WHERE user_id = $1`
	err := r.db.Pool.QueryRow(ctx, query, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get history count: %w", err)
	}
	return count, nil
}
