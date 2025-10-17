package model

import "time"

type WatchHistory struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	VideoID   int64     `json:"video_id"`
	WatchedAt time.Time `json:"watched_at"`
	Video     *VideoWithProfile `json:"video,omitempty"`
}

type AddToHistoryRequest struct {
	VideoID int64 `json:"video_id" binding:"required"`
}
