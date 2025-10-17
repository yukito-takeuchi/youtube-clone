package model

import "time"

type Video struct {
	ID           int64     `json:"id"`
	UserID       int64     `json:"user_id"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	VideoURL     string    `json:"video_url"`
	ThumbnailURL string    `json:"thumbnail_url"`
	Duration     int64     `json:"duration"` // Duration in seconds
	ViewCount    int64     `json:"view_count"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type VideoWithProfile struct {
	ID           int64     `json:"id"`
	UserID       int64     `json:"user_id"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	VideoURL     string    `json:"video_url"`
	ThumbnailURL string    `json:"thumbnail_url"`
	Duration     int64     `json:"duration"` // Duration in seconds
	ViewCount    int64     `json:"view_count"`
	LikeCount    int64     `json:"like_count"` // Total number of likes
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Profile      *Profile  `json:"profile"`
}

type CreateVideoRequest struct {
	Title        string `json:"title" binding:"required"`
	Description  string `json:"description"`
	VideoURL     string `json:"video_url"`
	ThumbnailURL string `json:"thumbnail_url"`
}

type UpdateVideoRequest struct {
	Title        string `json:"title"`
	Description  string `json:"description"`
	VideoURL     string `json:"video_url"`
	ThumbnailURL string `json:"thumbnail_url"`
}
