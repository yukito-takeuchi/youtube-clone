package model

import "time"

type Playlist struct {
	ID          int64     `json:"id"`
	UserID      int64     `json:"user_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Visibility  string    `json:"visibility"` // 'public', 'unlisted', 'private'
	VideoCount  int       `json:"video_count,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type PlaylistVideo struct {
	ID         int64     `json:"id"`
	PlaylistID int64     `json:"playlist_id"`
	VideoID    int64     `json:"video_id"`
	Position   int       `json:"position"`
	CreatedAt  time.Time `json:"created_at"`
	Video      *VideoWithProfile `json:"video,omitempty"`
}

type CreatePlaylistRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Visibility  string `json:"visibility"` // default: 'private'
}

type UpdatePlaylistRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Visibility  string `json:"visibility"`
}

type AddVideoToPlaylistRequest struct {
	VideoID int64 `json:"video_id" binding:"required"`
}
