package repository

import (
	"context"
	"fmt"

	"github.com/yukito/video-platform/internal/database"
	"github.com/yukito/video-platform/internal/model"
)

type CommentRepository struct {
	db *database.Database
}

func NewCommentRepository(db *database.Database) *CommentRepository {
	return &CommentRepository{db: db}
}

func (r *CommentRepository) Create(ctx context.Context, comment *model.Comment) (*model.Comment, error) {
	err := r.db.Pool.QueryRow(ctx, `
		INSERT INTO comments (video_id, user_id, parent_comment_id, content, like_count, is_pinned, is_creator_liked)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, video_id, user_id, parent_comment_id, content, like_count, is_pinned, is_creator_liked, created_at, updated_at
	`, comment.VideoID, comment.UserID, comment.ParentCommentID, comment.Content, comment.LikeCount, comment.IsPinned, comment.IsCreatorLiked).Scan(
		&comment.ID,
		&comment.VideoID,
		&comment.UserID,
		&comment.ParentCommentID,
		&comment.Content,
		&comment.LikeCount,
		&comment.IsPinned,
		&comment.IsCreatorLiked,
		&comment.CreatedAt,
		&comment.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create comment: %w", err)
	}
	return comment, nil
}

func (r *CommentRepository) FindByID(ctx context.Context, id int64) (*model.Comment, error) {
	comment := &model.Comment{}
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, video_id, user_id, parent_comment_id, content, like_count, is_pinned, is_creator_liked, created_at, updated_at
		FROM comments
		WHERE id = $1
	`, id).Scan(
		&comment.ID,
		&comment.VideoID,
		&comment.UserID,
		&comment.ParentCommentID,
		&comment.Content,
		&comment.LikeCount,
		&comment.IsPinned,
		&comment.IsCreatorLiked,
		&comment.CreatedAt,
		&comment.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to find comment: %w", err)
	}
	return comment, nil
}

// FindByVideoIDWithProfile returns paginated top-level comments with profile info
func (r *CommentRepository) FindByVideoIDWithProfile(ctx context.Context, videoID int64, userID *int64, limit, offset int) ([]*model.CommentWithProfile, error) {
	query := `
		SELECT
			c.id, c.video_id, c.user_id, c.parent_comment_id, c.content,
			c.like_count, c.is_pinned, c.is_creator_liked, c.created_at, c.updated_at,
			p.id, p.user_id, p.channel_name, p.description, p.icon_url, p.banner_url, p.created_at, p.updated_at,
			(SELECT COUNT(*) FROM comments WHERE parent_comment_id = c.id) as reply_count,
			COALESCE(cl.like_type, '') as user_like_type,
			(v.user_id = c.user_id) as is_video_creator
		FROM comments c
		LEFT JOIN profiles p ON c.user_id = p.user_id
		LEFT JOIN videos v ON c.video_id = v.id
		LEFT JOIN comment_likes cl ON c.id = cl.comment_id AND cl.user_id = $2
		WHERE c.video_id = $1 AND c.parent_comment_id IS NULL
		ORDER BY c.is_pinned DESC, c.created_at DESC
		LIMIT $3 OFFSET $4
	`

	var rows interface{ Close() }
	var err error

	if userID != nil {
		rows, err = r.db.Pool.Query(ctx, query, videoID, *userID, limit, offset)
	} else {
		rows, err = r.db.Pool.Query(ctx, query, videoID, 0, limit, offset)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to find comments: %w", err)
	}
	defer rows.(interface{ Close() }).Close()

	comments := []*model.CommentWithProfile{}
	for rows.(interface {
		Next() bool
		Scan(...interface{}) error
	}).Next() {
		comment := &model.CommentWithProfile{Profile: &model.Profile{}}
		var userLikeType string

		err := rows.(interface {
			Next() bool
			Scan(...interface{}) error
		}).Scan(
			&comment.ID,
			&comment.VideoID,
			&comment.UserID,
			&comment.ParentCommentID,
			&comment.Content,
			&comment.LikeCount,
			&comment.IsPinned,
			&comment.IsCreatorLiked,
			&comment.CreatedAt,
			&comment.UpdatedAt,
			&comment.Profile.ID,
			&comment.Profile.UserID,
			&comment.Profile.ChannelName,
			&comment.Profile.Description,
			&comment.Profile.IconURL,
			&comment.Profile.BannerURL,
			&comment.Profile.CreatedAt,
			&comment.Profile.UpdatedAt,
			&comment.ReplyCount,
			&userLikeType,
			&comment.IsVideoCreator,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan comment: %w", err)
		}

		if userLikeType != "" {
			comment.UserLikeType = &userLikeType
		}

		comments = append(comments, comment)
	}

	return comments, nil
}

// FindRepliesByParentIDWithProfile returns paginated replies for a parent comment
func (r *CommentRepository) FindRepliesByParentIDWithProfile(ctx context.Context, parentCommentID int64, userID *int64, limit, offset int) ([]*model.CommentWithProfile, error) {
	query := `
		SELECT
			c.id, c.video_id, c.user_id, c.parent_comment_id, c.content,
			c.like_count, c.is_pinned, c.is_creator_liked, c.created_at, c.updated_at,
			p.id, p.user_id, p.channel_name, p.description, p.icon_url, p.banner_url, p.created_at, p.updated_at,
			0 as reply_count,
			COALESCE(cl.like_type, '') as user_like_type,
			(v.user_id = c.user_id) as is_video_creator
		FROM comments c
		LEFT JOIN profiles p ON c.user_id = p.user_id
		LEFT JOIN videos v ON c.video_id = v.id
		LEFT JOIN comment_likes cl ON c.id = cl.comment_id AND cl.user_id = $2
		WHERE c.parent_comment_id = $1
		ORDER BY c.created_at ASC
		LIMIT $3 OFFSET $4
	`

	var rows interface{ Close() }
	var err error

	if userID != nil {
		rows, err = r.db.Pool.Query(ctx, query, parentCommentID, *userID, limit, offset)
	} else {
		rows, err = r.db.Pool.Query(ctx, query, parentCommentID, 0, limit, offset)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to find replies: %w", err)
	}
	defer rows.(interface{ Close() }).Close()

	comments := []*model.CommentWithProfile{}
	for rows.(interface {
		Next() bool
		Scan(...interface{}) error
	}).Next() {
		comment := &model.CommentWithProfile{Profile: &model.Profile{}}
		var userLikeType string

		err := rows.(interface {
			Next() bool
			Scan(...interface{}) error
		}).Scan(
			&comment.ID,
			&comment.VideoID,
			&comment.UserID,
			&comment.ParentCommentID,
			&comment.Content,
			&comment.LikeCount,
			&comment.IsPinned,
			&comment.IsCreatorLiked,
			&comment.CreatedAt,
			&comment.UpdatedAt,
			&comment.Profile.ID,
			&comment.Profile.UserID,
			&comment.Profile.ChannelName,
			&comment.Profile.Description,
			&comment.Profile.IconURL,
			&comment.Profile.BannerURL,
			&comment.Profile.CreatedAt,
			&comment.Profile.UpdatedAt,
			&comment.ReplyCount,
			&userLikeType,
			&comment.IsVideoCreator,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan reply: %w", err)
		}

		if userLikeType != "" {
			comment.UserLikeType = &userLikeType
		}

		comments = append(comments, comment)
	}

	return comments, nil
}

func (r *CommentRepository) Update(ctx context.Context, comment *model.Comment) (*model.Comment, error) {
	err := r.db.Pool.QueryRow(ctx, `
		UPDATE comments
		SET content = $1, updated_at = NOW()
		WHERE id = $2
		RETURNING id, video_id, user_id, parent_comment_id, content, like_count, is_pinned, is_creator_liked, created_at, updated_at
	`, comment.Content, comment.ID).Scan(
		&comment.ID,
		&comment.VideoID,
		&comment.UserID,
		&comment.ParentCommentID,
		&comment.Content,
		&comment.LikeCount,
		&comment.IsPinned,
		&comment.IsCreatorLiked,
		&comment.CreatedAt,
		&comment.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update comment: %w", err)
	}
	return comment, nil
}

func (r *CommentRepository) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Pool.Exec(ctx, `
		DELETE FROM comments WHERE id = $1
	`, id)
	if err != nil {
		return fmt.Errorf("failed to delete comment: %w", err)
	}
	return nil
}

func (r *CommentRepository) PinComment(ctx context.Context, commentID int64, isPinned bool) error {
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE comments SET is_pinned = $1, updated_at = NOW() WHERE id = $2
	`, isPinned, commentID)
	if err != nil {
		return fmt.Errorf("failed to pin comment: %w", err)
	}
	return nil
}

func (r *CommentRepository) SetCreatorLiked(ctx context.Context, commentID int64, isCreatorLiked bool) error {
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE comments SET is_creator_liked = $1, updated_at = NOW() WHERE id = $2
	`, isCreatorLiked, commentID)
	if err != nil {
		return fmt.Errorf("failed to set creator liked: %w", err)
	}
	return nil
}

// LikeComment adds or updates a like/dislike on a comment
func (r *CommentRepository) LikeComment(ctx context.Context, commentID, userID int64, likeType string) error {
	// First, check if a like already exists
	var existingLikeType string
	err := r.db.Pool.QueryRow(ctx, `
		SELECT like_type FROM comment_likes WHERE comment_id = $1 AND user_id = $2
	`, commentID, userID).Scan(&existingLikeType)

	if err == nil {
		// Like exists, update it
		_, err = r.db.Pool.Exec(ctx, `
			UPDATE comment_likes SET like_type = $1 WHERE comment_id = $2 AND user_id = $3
		`, likeType, commentID, userID)
		if err != nil {
			return fmt.Errorf("failed to update comment like: %w", err)
		}

		// Update like count based on change
		if existingLikeType == "like" && likeType == "dislike" {
			_, err = r.db.Pool.Exec(ctx, `
				UPDATE comments SET like_count = like_count - 1 WHERE id = $1
			`, commentID)
		} else if existingLikeType == "dislike" && likeType == "like" {
			_, err = r.db.Pool.Exec(ctx, `
				UPDATE comments SET like_count = like_count + 1 WHERE id = $1
			`, commentID)
		}
	} else {
		// No existing like, insert new one
		_, err = r.db.Pool.Exec(ctx, `
			INSERT INTO comment_likes (comment_id, user_id, like_type) VALUES ($1, $2, $3)
		`, commentID, userID, likeType)
		if err != nil {
			return fmt.Errorf("failed to create comment like: %w", err)
		}

		// Update like count if it's a like
		if likeType == "like" {
			_, err = r.db.Pool.Exec(ctx, `
				UPDATE comments SET like_count = like_count + 1 WHERE id = $1
			`, commentID)
		}
	}

	if err != nil {
		return fmt.Errorf("failed to update comment like count: %w", err)
	}

	return nil
}

// UnlikeComment removes a like/dislike from a comment
func (r *CommentRepository) UnlikeComment(ctx context.Context, commentID, userID int64) error {
	// Get the existing like type
	var likeType string
	err := r.db.Pool.QueryRow(ctx, `
		SELECT like_type FROM comment_likes WHERE comment_id = $1 AND user_id = $2
	`, commentID, userID).Scan(&likeType)

	if err != nil {
		return fmt.Errorf("failed to find comment like: %w", err)
	}

	// Delete the like
	_, err = r.db.Pool.Exec(ctx, `
		DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2
	`, commentID, userID)
	if err != nil {
		return fmt.Errorf("failed to delete comment like: %w", err)
	}

	// Update like count if it was a like
	if likeType == "like" {
		_, err = r.db.Pool.Exec(ctx, `
			UPDATE comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1
		`, commentID)
		if err != nil {
			return fmt.Errorf("failed to update comment like count: %w", err)
		}
	}

	return nil
}

// GetCommentCount returns the total number of comments for a video (including replies)
func (r *CommentRepository) GetCommentCount(ctx context.Context, videoID int64) (int64, error) {
	var count int64
	err := r.db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM comments WHERE video_id = $1
	`, videoID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get comment count: %w", err)
	}
	return count, nil
}
