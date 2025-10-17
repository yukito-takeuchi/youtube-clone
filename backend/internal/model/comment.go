package model

import "time"

type Comment struct {
	ID              int64     `json:"id"`
	VideoID         int64     `json:"video_id"`
	UserID          int64     `json:"user_id"`
	ParentCommentID *int64    `json:"parent_comment_id"` // NULL for top-level comments
	Content         string    `json:"content"`
	LikeCount       int64     `json:"like_count"`
	IsPinned        bool      `json:"is_pinned"`
	IsCreatorLiked  bool      `json:"is_creator_liked"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type CommentWithProfile struct {
	ID              int64     `json:"id"`
	VideoID         int64     `json:"video_id"`
	UserID          int64     `json:"user_id"`
	ParentCommentID *int64    `json:"parent_comment_id"`
	Content         string    `json:"content"`
	LikeCount       int64     `json:"like_count"`
	IsPinned        bool      `json:"is_pinned"`
	IsCreatorLiked  bool      `json:"is_creator_liked"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	Profile         *Profile  `json:"profile"`
	ReplyCount      int64     `json:"reply_count"`      // Number of replies
	UserLikeType    *string   `json:"user_like_type"`   // "like", "dislike", or null
	IsVideoCreator  bool      `json:"is_video_creator"` // Whether commenter is the video creator
}

type CommentLike struct {
	ID        int64     `json:"id"`
	CommentID int64     `json:"comment_id"`
	UserID    int64     `json:"user_id"`
	LikeType  string    `json:"like_type"` // "like" or "dislike"
	CreatedAt time.Time `json:"created_at"`
}

type CreateCommentRequest struct {
	VideoID         int64  `json:"video_id" binding:"required"`
	ParentCommentID *int64 `json:"parent_comment_id"`
	Content         string `json:"content" binding:"required"`
}

type UpdateCommentRequest struct {
	Content string `json:"content" binding:"required"`
}

type LikeCommentRequest struct {
	LikeType string `json:"like_type" binding:"required"` // "like" or "dislike"
}
