package service

import (
	"context"
	"errors"
	"fmt"
	"io"

	"github.com/yukito/video-platform/internal/model"
	"github.com/yukito/video-platform/internal/repository"
	"github.com/yukito/video-platform/internal/storage"
)

type VideoService struct {
	videoRepo   *repository.VideoRepository
	profileRepo *repository.ProfileRepository
	storage     storage.Storage
}

func NewVideoService(videoRepo *repository.VideoRepository, profileRepo *repository.ProfileRepository, st storage.Storage) *VideoService {
	return &VideoService{
		videoRepo:   videoRepo,
		profileRepo: profileRepo,
		storage:     st,
	}
}

func (s *VideoService) Create(ctx context.Context, userID int64, req *model.CreateVideoRequest) (*model.Video, error) {
	video := &model.Video{
		UserID:       userID,
		Title:        req.Title,
		Description:  req.Description,
		VideoURL:     req.VideoURL,
		ThumbnailURL: req.ThumbnailURL,
		ViewCount:    0,
	}

	createdVideo, err := s.videoRepo.Create(ctx, video)
	if err != nil {
		return nil, fmt.Errorf("failed to create video: %w", err)
	}

	return createdVideo, nil
}

func (s *VideoService) CreateWithFiles(ctx context.Context, userID int64, title, description string, duration int64, videoFile io.Reader, videoFilename, videoContentType string, videoSize int64, thumbnailFile io.Reader, thumbnailFilename, thumbnailContentType string, thumbnailSize int64) (*model.Video, error) {
	var videoURL, thumbnailURL string
	var err error

	// Upload video file
	if videoFile != nil {
		videoURL, err = s.storage.UploadFile(ctx, videoFile, videoFilename, videoContentType, videoSize)
		if err != nil {
			return nil, fmt.Errorf("failed to upload video: %w", err)
		}
	}

	// Upload thumbnail file
	if thumbnailFile != nil {
		thumbnailURL, err = s.storage.UploadFile(ctx, thumbnailFile, thumbnailFilename, thumbnailContentType, thumbnailSize)
		if err != nil {
			// Cleanup video if thumbnail upload fails
			if videoURL != "" {
				_ = s.storage.DeleteFile(ctx, videoURL)
			}
			return nil, fmt.Errorf("failed to upload thumbnail: %w", err)
		}
	}

	video := &model.Video{
		UserID:       userID,
		Title:        title,
		Description:  description,
		VideoURL:     videoURL,
		ThumbnailURL: thumbnailURL,
		Duration:     duration,
		ViewCount:    0,
	}

	createdVideo, err := s.videoRepo.Create(ctx, video)
	if err != nil {
		// Cleanup uploaded files if database insert fails
		if videoURL != "" {
			_ = s.storage.DeleteFile(ctx, videoURL)
		}
		if thumbnailURL != "" {
			_ = s.storage.DeleteFile(ctx, thumbnailURL)
		}
		return nil, fmt.Errorf("failed to create video: %w", err)
	}

	return createdVideo, nil
}

func (s *VideoService) GetByID(ctx context.Context, id int64) (*model.VideoWithProfile, error) {
	video, err := s.videoRepo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to find video: %w", err)
	}

	// Get profile
	profile, err := s.profileRepo.FindByUserID(ctx, video.UserID)
	if err != nil {
		// If profile not found, return video without profile
		profile = nil
	}

	// Get like count
	likeCount, err := s.videoRepo.GetLikeCount(ctx, id)
	if err != nil {
		likeCount = 0
	}

	// Increment view count
	_ = s.videoRepo.IncrementViewCount(ctx, id)

	videoWithProfile := &model.VideoWithProfile{
		ID:           video.ID,
		UserID:       video.UserID,
		Title:        video.Title,
		Description:  video.Description,
		VideoURL:     video.VideoURL,
		ThumbnailURL: video.ThumbnailURL,
		Duration:     video.Duration,
		ViewCount:    video.ViewCount,
		LikeCount:    likeCount,
		CreatedAt:    video.CreatedAt,
		UpdatedAt:    video.UpdatedAt,
		Profile:      profile,
	}

	return videoWithProfile, nil
}

func (s *VideoService) List(ctx context.Context) ([]*model.VideoWithProfile, error) {
	videos, err := s.videoRepo.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to find videos: %w", err)
	}

	// Get profiles and like counts for all videos
	videosWithProfile := make([]*model.VideoWithProfile, len(videos))
	for i, video := range videos {
		profile, err := s.profileRepo.FindByUserID(ctx, video.UserID)
		if err != nil {
			profile = nil
		}

		likeCount, err := s.videoRepo.GetLikeCount(ctx, video.ID)
		if err != nil {
			likeCount = 0
		}

		videosWithProfile[i] = &model.VideoWithProfile{
			ID:           video.ID,
			UserID:       video.UserID,
			Title:        video.Title,
			Description:  video.Description,
			VideoURL:     video.VideoURL,
			ThumbnailURL: video.ThumbnailURL,
			Duration:     video.Duration,
			ViewCount:    video.ViewCount,
			LikeCount:    likeCount,
			CreatedAt:    video.CreatedAt,
			UpdatedAt:    video.UpdatedAt,
			Profile:      profile,
		}
	}

	return videosWithProfile, nil
}

func (s *VideoService) Update(ctx context.Context, userID, videoID int64, req *model.UpdateVideoRequest) (*model.Video, error) {
	// Check if video exists and belongs to user
	existingVideo, err := s.videoRepo.FindByID(ctx, videoID)
	if err != nil {
		return nil, fmt.Errorf("video not found: %w", err)
	}

	if existingVideo.UserID != userID {
		return nil, errors.New("unauthorized to update this video")
	}

	// Update only provided fields
	if req.Title != "" {
		existingVideo.Title = req.Title
	}
	if req.Description != "" {
		existingVideo.Description = req.Description
	}
	if req.VideoURL != "" {
		existingVideo.VideoURL = req.VideoURL
	}
	if req.ThumbnailURL != "" {
		existingVideo.ThumbnailURL = req.ThumbnailURL
	}

	updatedVideo, err := s.videoRepo.Update(ctx, existingVideo)
	if err != nil {
		return nil, fmt.Errorf("failed to update video: %w", err)
	}

	return updatedVideo, nil
}

func (s *VideoService) UpdateWithFiles(ctx context.Context, userID, videoID int64, title, description string, videoFile io.Reader, videoFilename, videoContentType string, videoSize int64, thumbnailFile io.Reader, thumbnailFilename, thumbnailContentType string, thumbnailSize int64) (*model.Video, error) {
	// Check if video exists and belongs to user
	existingVideo, err := s.videoRepo.FindByID(ctx, videoID)
	if err != nil {
		return nil, fmt.Errorf("video not found: %w", err)
	}

	if existingVideo.UserID != userID {
		return nil, errors.New("unauthorized to update this video")
	}

	// Store old URLs for cleanup
	oldVideoURL := existingVideo.VideoURL
	oldThumbnailURL := existingVideo.ThumbnailURL

	// Upload new video file if provided
	if videoFile != nil {
		newVideoURL, err := s.storage.UploadFile(ctx, videoFile, videoFilename, videoContentType, videoSize)
		if err != nil {
			return nil, fmt.Errorf("failed to upload video: %w", err)
		}
		existingVideo.VideoURL = newVideoURL
	}

	// Upload new thumbnail file if provided
	if thumbnailFile != nil {
		newThumbnailURL, err := s.storage.UploadFile(ctx, thumbnailFile, thumbnailFilename, thumbnailContentType, thumbnailSize)
		if err != nil {
			// Cleanup newly uploaded video if thumbnail upload fails
			if videoFile != nil && existingVideo.VideoURL != oldVideoURL {
				_ = s.storage.DeleteFile(ctx, existingVideo.VideoURL)
			}
			return nil, fmt.Errorf("failed to upload thumbnail: %w", err)
		}
		existingVideo.ThumbnailURL = newThumbnailURL
	}

	// Update text fields
	existingVideo.Title = title
	existingVideo.Description = description

	// Update database
	updatedVideo, err := s.videoRepo.Update(ctx, existingVideo)
	if err != nil {
		// Cleanup newly uploaded files if database update fails
		if videoFile != nil && existingVideo.VideoURL != oldVideoURL {
			_ = s.storage.DeleteFile(ctx, existingVideo.VideoURL)
		}
		if thumbnailFile != nil && existingVideo.ThumbnailURL != oldThumbnailURL {
			_ = s.storage.DeleteFile(ctx, existingVideo.ThumbnailURL)
		}
		return nil, fmt.Errorf("failed to update video: %w", err)
	}

	// Delete old files after successful update
	if videoFile != nil && oldVideoURL != "" {
		_ = s.storage.DeleteFile(ctx, oldVideoURL)
	}
	if thumbnailFile != nil && oldThumbnailURL != "" {
		_ = s.storage.DeleteFile(ctx, oldThumbnailURL)
	}

	return updatedVideo, nil
}

func (s *VideoService) Delete(ctx context.Context, userID, videoID int64) error {
	// Check if video exists and belongs to user
	existingVideo, err := s.videoRepo.FindByID(ctx, videoID)
	if err != nil {
		return fmt.Errorf("video not found: %w", err)
	}

	if existingVideo.UserID != userID {
		return errors.New("unauthorized to delete this video")
	}

	if err := s.videoRepo.Delete(ctx, videoID); err != nil {
		return fmt.Errorf("failed to delete video: %w", err)
	}

	return nil
}
