package repository

import (
	"context"
	"fmt"

	"github.com/yukito/video-platform/internal/database"
	"github.com/yukito/video-platform/internal/model"
)

type SubscriptionRepository struct {
	db *database.Database
}

func NewSubscriptionRepository(db *database.Database) *SubscriptionRepository {
	return &SubscriptionRepository{db: db}
}

// Subscribe creates a subscription relationship
func (r *SubscriptionRepository) Subscribe(ctx context.Context, subscriberUserID, subscribedToUserID int64) error {
	query := `
		INSERT INTO subscriptions (subscriber_user_id, subscribed_to_user_id)
		VALUES ($1, $2)
		ON CONFLICT (subscriber_user_id, subscribed_to_user_id) DO NOTHING
	`
	_, err := r.db.Pool.Exec(ctx, query, subscriberUserID, subscribedToUserID)
	if err != nil {
		return fmt.Errorf("failed to subscribe: %w", err)
	}
	return nil
}

// Unsubscribe removes a subscription relationship
func (r *SubscriptionRepository) Unsubscribe(ctx context.Context, subscriberUserID, subscribedToUserID int64) error {
	query := `
		DELETE FROM subscriptions
		WHERE subscriber_user_id = $1 AND subscribed_to_user_id = $2
	`
	_, err := r.db.Pool.Exec(ctx, query, subscriberUserID, subscribedToUserID)
	if err != nil {
		return fmt.Errorf("failed to unsubscribe: %w", err)
	}
	return nil
}

// IsSubscribed checks if a user is subscribed to another user
func (r *SubscriptionRepository) IsSubscribed(ctx context.Context, subscriberUserID, subscribedToUserID int64) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM subscriptions
			WHERE subscriber_user_id = $1 AND subscribed_to_user_id = $2
		)
	`
	var exists bool
	err := r.db.Pool.QueryRow(ctx, query, subscriberUserID, subscribedToUserID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check subscription: %w", err)
	}
	return exists, nil
}

// GetSubscriberCount returns the number of subscribers for a user
func (r *SubscriptionRepository) GetSubscriberCount(ctx context.Context, userID int64) (int64, error) {
	query := `
		SELECT COUNT(*) FROM subscriptions
		WHERE subscribed_to_user_id = $1
	`
	var count int64
	err := r.db.Pool.QueryRow(ctx, query, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get subscriber count: %w", err)
	}
	return count, nil
}

// GetSubscribedChannels returns the list of channels a user is subscribed to
func (r *SubscriptionRepository) GetSubscribedChannels(ctx context.Context, subscriberUserID int64) ([]*model.SubscriptionWithProfile, error) {
	query := `
		SELECT
			s.id, s.subscriber_user_id, s.subscribed_to_user_id, s.created_at,
			p.id, p.user_id, p.channel_name, p.description, p.icon_url, p.banner_url, p.created_at, p.updated_at
		FROM subscriptions s
		LEFT JOIN profiles p ON s.subscribed_to_user_id = p.user_id
		WHERE s.subscriber_user_id = $1
		ORDER BY s.created_at DESC
	`

	rows, err := r.db.Pool.Query(ctx, query, subscriberUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get subscribed channels: %w", err)
	}
	defer rows.Close()

	var subscriptions []*model.SubscriptionWithProfile
	for rows.Next() {
		var sub model.SubscriptionWithProfile
		var profile model.Profile

		err := rows.Scan(
			&sub.ID,
			&sub.SubscriberUserID,
			&sub.SubscribedToUserID,
			&sub.CreatedAt,
			&profile.ID,
			&profile.UserID,
			&profile.ChannelName,
			&profile.Description,
			&profile.IconURL,
			&profile.BannerURL,
			&profile.CreatedAt,
			&profile.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan subscription: %w", err)
		}

		sub.Profile = &profile
		subscriptions = append(subscriptions, &sub)
	}

	return subscriptions, nil
}

// GetSubscriptionFeed returns videos from channels the user is subscribed to
func (r *SubscriptionRepository) GetSubscriptionFeed(ctx context.Context, subscriberUserID int64, limit, offset int) ([]*model.VideoWithProfile, error) {
	query := `
		SELECT
			v.id, v.user_id, v.title, v.description, v.video_url, v.thumbnail_url, v.duration, v.view_count, v.created_at, v.updated_at,
			p.id, p.user_id, p.channel_name, p.description, p.icon_url, p.banner_url, p.created_at, p.updated_at
		FROM videos v
		INNER JOIN subscriptions s ON v.user_id = s.subscribed_to_user_id
		LEFT JOIN profiles p ON v.user_id = p.user_id
		WHERE s.subscriber_user_id = $1
		ORDER BY v.created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Pool.Query(ctx, query, subscriberUserID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get subscription feed: %w", err)
	}
	defer rows.Close()

	var videos []*model.VideoWithProfile
	for rows.Next() {
		var video model.VideoWithProfile
		var profile model.Profile

		err := rows.Scan(
			&video.ID,
			&video.UserID,
			&video.Title,
			&video.Description,
			&video.VideoURL,
			&video.ThumbnailURL,
			&video.Duration,
			&video.ViewCount,
			&video.CreatedAt,
			&video.UpdatedAt,
			&profile.ID,
			&profile.UserID,
			&profile.ChannelName,
			&profile.Description,
			&profile.IconURL,
			&profile.BannerURL,
			&profile.CreatedAt,
			&profile.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan video: %w", err)
		}

		video.Profile = &profile
		videos = append(videos, &video)
	}

	return videos, nil
}
