package repository

import (
	"context"
	"fmt"
	"strings"

	"github.com/yukito/video-platform/internal/database"
	"github.com/yukito/video-platform/internal/model"
)

type ProfileRepository struct {
	db *database.Database
}

func NewProfileRepository(db *database.Database) *ProfileRepository {
	return &ProfileRepository{db: db}
}

func (r *ProfileRepository) Create(ctx context.Context, userID int64, email, defaultIconURL, defaultBannerURL string) (*model.Profile, error) {
	// Extract channel name from email (part before @)
	channelName := email
	if atIndex := strings.Index(email, "@"); atIndex != -1 {
		channelName = email[:atIndex]
	}

	// Default description (YouTube style)
	description := "このチャンネルの説明はありません。"

	profile := &model.Profile{}
	err := r.db.Pool.QueryRow(ctx, `
		INSERT INTO profiles (user_id, channel_name, description, icon_url, banner_url)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, user_id, channel_name, description, icon_url, banner_url, created_at, updated_at
	`, userID, channelName, description, defaultIconURL, defaultBannerURL).Scan(
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
		return nil, fmt.Errorf("failed to create profile: %w", err)
	}
	return profile, nil
}

func (r *ProfileRepository) FindByUserID(ctx context.Context, userID int64) (*model.Profile, error) {
	profile := &model.Profile{}
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, user_id, channel_name, description, icon_url, banner_url, created_at, updated_at
		FROM profiles
		WHERE user_id = $1
	`, userID).Scan(
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
		return nil, fmt.Errorf("failed to find profile: %w", err)
	}
	return profile, nil
}

func (r *ProfileRepository) Update(ctx context.Context, profile *model.Profile) (*model.Profile, error) {
	err := r.db.Pool.QueryRow(ctx, `
		UPDATE profiles
		SET channel_name = $1, description = $2, icon_url = $3, banner_url = $4, updated_at = NOW()
		WHERE user_id = $5
		RETURNING id, user_id, channel_name, description, icon_url, banner_url, created_at, updated_at
	`, profile.ChannelName, profile.Description, profile.IconURL, profile.BannerURL, profile.UserID).Scan(
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
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}
	return profile, nil
}
