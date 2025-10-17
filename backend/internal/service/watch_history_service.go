package service

import (
	"context"
	"fmt"

	"github.com/yukito/video-platform/internal/model"
	"github.com/yukito/video-platform/internal/repository"
)

type WatchHistoryService struct {
	historyRepo *repository.WatchHistoryRepository
	videoRepo   *repository.VideoRepository
}

func NewWatchHistoryService(historyRepo *repository.WatchHistoryRepository, videoRepo *repository.VideoRepository) *WatchHistoryService {
	return &WatchHistoryService{
		historyRepo: historyRepo,
		videoRepo:   videoRepo,
	}
}

// AddToHistory adds a video to user's watch history
func (s *WatchHistoryService) AddToHistory(ctx context.Context, userID, videoID int64) error {
	// Check if video exists
	_, err := s.videoRepo.FindByID(ctx, videoID)
	if err != nil {
		return fmt.Errorf("video not found: %w", err)
	}

	// Add to history
	if err := s.historyRepo.AddToHistory(ctx, userID, videoID); err != nil {
		return fmt.Errorf("failed to add to history: %w", err)
	}

	return nil
}

// GetWatchHistory returns user's watch history with pagination
func (s *WatchHistoryService) GetWatchHistory(ctx context.Context, userID int64, limit, offset int) ([]*model.WatchHistory, error) {
	history, err := s.historyRepo.GetWatchHistory(ctx, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get watch history: %w", err)
	}

	return history, nil
}

// RemoveFromHistory removes a specific video from user's watch history
func (s *WatchHistoryService) RemoveFromHistory(ctx context.Context, userID, videoID int64) error {
	if err := s.historyRepo.RemoveFromHistory(ctx, userID, videoID); err != nil {
		return fmt.Errorf("failed to remove from history: %w", err)
	}

	return nil
}

// ClearHistory removes all watch history for a user
func (s *WatchHistoryService) ClearHistory(ctx context.Context, userID int64) error {
	if err := s.historyRepo.ClearHistory(ctx, userID); err != nil {
		return fmt.Errorf("failed to clear history: %w", err)
	}

	return nil
}

// GetHistoryCount returns the total number of videos in user's watch history
func (s *WatchHistoryService) GetHistoryCount(ctx context.Context, userID int64) (int64, error) {
	count, err := s.historyRepo.GetHistoryCount(ctx, userID)
	if err != nil {
		return 0, fmt.Errorf("failed to get history count: %w", err)
	}

	return count, nil
}
