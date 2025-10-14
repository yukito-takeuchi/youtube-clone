package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/yukito/video-platform/internal/model"
	"github.com/yukito/video-platform/internal/repository"
)

type CommentService struct {
	commentRepo *repository.CommentRepository
	videoRepo   *repository.VideoRepository
}

func NewCommentService(commentRepo *repository.CommentRepository, videoRepo *repository.VideoRepository) *CommentService {
	return &CommentService{
		commentRepo: commentRepo,
		videoRepo:   videoRepo,
	}
}

func (s *CommentService) Create(ctx context.Context, userID int64, req *model.CreateCommentRequest) (*model.CommentWithProfile, error) {
	// Verify video exists
	_, err := s.videoRepo.FindByID(ctx, req.VideoID)
	if err != nil {
		return nil, fmt.Errorf("video not found: %w", err)
	}

	// If replying to a comment, verify parent comment exists
	if req.ParentCommentID != nil {
		parentComment, err := s.commentRepo.FindByID(ctx, *req.ParentCommentID)
		if err != nil {
			return nil, fmt.Errorf("parent comment not found: %w", err)
		}
		// Don't allow nested replies (only 1 level)
		if parentComment.ParentCommentID != nil {
			return nil, errors.New("cannot reply to a reply")
		}
	}

	comment := &model.Comment{
		VideoID:         req.VideoID,
		UserID:          userID,
		ParentCommentID: req.ParentCommentID,
		Content:         req.Content,
		LikeCount:       0,
		IsPinned:        false,
		IsCreatorLiked:  false,
	}

	createdComment, err := s.commentRepo.Create(ctx, comment)
	if err != nil {
		return nil, fmt.Errorf("failed to create comment: %w", err)
	}

	// Fetch the comment with profile
	comments, err := s.commentRepo.FindByVideoIDWithProfile(ctx, createdComment.VideoID, &userID, 1, 0)
	if err != nil || len(comments) == 0 {
		// Fallback: return basic comment data
		return &model.CommentWithProfile{
			ID:              createdComment.ID,
			VideoID:         createdComment.VideoID,
			UserID:          createdComment.UserID,
			ParentCommentID: createdComment.ParentCommentID,
			Content:         createdComment.Content,
			LikeCount:       createdComment.LikeCount,
			IsPinned:        createdComment.IsPinned,
			IsCreatorLiked:  createdComment.IsCreatorLiked,
			CreatedAt:       createdComment.CreatedAt,
			UpdatedAt:       createdComment.UpdatedAt,
			ReplyCount:      0,
		}, nil
	}

	return comments[0], nil
}

func (s *CommentService) GetCommentsByVideoID(ctx context.Context, videoID int64, userID *int64, limit, offset int) ([]*model.CommentWithProfile, error) {
	// Verify video exists
	_, err := s.videoRepo.FindByID(ctx, videoID)
	if err != nil {
		return nil, fmt.Errorf("video not found: %w", err)
	}

	comments, err := s.commentRepo.FindByVideoIDWithProfile(ctx, videoID, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get comments: %w", err)
	}

	return comments, nil
}

func (s *CommentService) GetRepliesByParentID(ctx context.Context, parentCommentID int64, userID *int64, limit, offset int) ([]*model.CommentWithProfile, error) {
	// Verify parent comment exists
	_, err := s.commentRepo.FindByID(ctx, parentCommentID)
	if err != nil {
		return nil, fmt.Errorf("parent comment not found: %w", err)
	}

	replies, err := s.commentRepo.FindRepliesByParentIDWithProfile(ctx, parentCommentID, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get replies: %w", err)
	}

	return replies, nil
}

func (s *CommentService) Update(ctx context.Context, userID, commentID int64, req *model.UpdateCommentRequest) (*model.Comment, error) {
	// Check if comment exists and belongs to user
	existingComment, err := s.commentRepo.FindByID(ctx, commentID)
	if err != nil {
		return nil, fmt.Errorf("comment not found: %w", err)
	}

	if existingComment.UserID != userID {
		return nil, errors.New("unauthorized to update this comment")
	}

	existingComment.Content = req.Content

	updatedComment, err := s.commentRepo.Update(ctx, existingComment)
	if err != nil {
		return nil, fmt.Errorf("failed to update comment: %w", err)
	}

	return updatedComment, nil
}

func (s *CommentService) Delete(ctx context.Context, userID, commentID int64) error {
	// Check if comment exists and belongs to user
	existingComment, err := s.commentRepo.FindByID(ctx, commentID)
	if err != nil {
		return fmt.Errorf("comment not found: %w", err)
	}

	if existingComment.UserID != userID {
		return errors.New("unauthorized to delete this comment")
	}

	if err := s.commentRepo.Delete(ctx, commentID); err != nil {
		return fmt.Errorf("failed to delete comment: %w", err)
	}

	return nil
}

func (s *CommentService) PinComment(ctx context.Context, userID, commentID int64, isPinned bool) error {
	// Get the comment
	comment, err := s.commentRepo.FindByID(ctx, commentID)
	if err != nil {
		return fmt.Errorf("comment not found: %w", err)
	}

	// Get the video to check if user is the creator
	video, err := s.videoRepo.FindByID(ctx, comment.VideoID)
	if err != nil {
		return fmt.Errorf("video not found: %w", err)
	}

	// Only video creator can pin comments
	if video.UserID != userID {
		return errors.New("only video creator can pin comments")
	}

	// Can only pin top-level comments
	if comment.ParentCommentID != nil {
		return errors.New("cannot pin replies")
	}

	if err := s.commentRepo.PinComment(ctx, commentID, isPinned); err != nil {
		return fmt.Errorf("failed to pin comment: %w", err)
	}

	return nil
}

func (s *CommentService) SetCreatorLiked(ctx context.Context, userID, commentID int64, isCreatorLiked bool) error {
	// Get the comment
	comment, err := s.commentRepo.FindByID(ctx, commentID)
	if err != nil {
		return fmt.Errorf("comment not found: %w", err)
	}

	// Get the video to check if user is the creator
	video, err := s.videoRepo.FindByID(ctx, comment.VideoID)
	if err != nil {
		return fmt.Errorf("video not found: %w", err)
	}

	// Only video creator can mark comments as creator liked
	if video.UserID != userID {
		return errors.New("only video creator can mark comments as creator liked")
	}

	if err := s.commentRepo.SetCreatorLiked(ctx, commentID, isCreatorLiked); err != nil {
		return fmt.Errorf("failed to set creator liked: %w", err)
	}

	return nil
}

func (s *CommentService) LikeComment(ctx context.Context, userID, commentID int64, req *model.LikeCommentRequest) error {
	// Verify comment exists
	_, err := s.commentRepo.FindByID(ctx, commentID)
	if err != nil {
		return fmt.Errorf("comment not found: %w", err)
	}

	// Validate like type
	if req.LikeType != "like" && req.LikeType != "dislike" {
		return errors.New("invalid like type: must be 'like' or 'dislike'")
	}

	if err := s.commentRepo.LikeComment(ctx, commentID, userID, req.LikeType); err != nil {
		return fmt.Errorf("failed to like comment: %w", err)
	}

	return nil
}

func (s *CommentService) UnlikeComment(ctx context.Context, userID, commentID int64) error {
	// Verify comment exists
	_, err := s.commentRepo.FindByID(ctx, commentID)
	if err != nil {
		return fmt.Errorf("comment not found: %w", err)
	}

	if err := s.commentRepo.UnlikeComment(ctx, commentID, userID); err != nil {
		return fmt.Errorf("failed to unlike comment: %w", err)
	}

	return nil
}

func (s *CommentService) GetCommentCount(ctx context.Context, videoID int64) (int64, error) {
	count, err := s.commentRepo.GetCommentCount(ctx, videoID)
	if err != nil {
		return 0, fmt.Errorf("failed to get comment count: %w", err)
	}
	return count, nil
}
