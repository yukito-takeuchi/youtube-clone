package model

import "time"

type Profile struct {
	ID          int64     `json:"id"`
	UserID      int64     `json:"user_id"`
	ChannelName string    `json:"channel_name"`
	Description string    `json:"description"`
	IconURL     string    `json:"icon_url"`
	BannerURL   string    `json:"banner_url"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type UpdateProfileRequest struct {
	ChannelName string `json:"channel_name"`
	Description string `json:"description"`
}
