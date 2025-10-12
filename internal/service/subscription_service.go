package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/yukito/video-platform/internal/model"
	"github.com/yukito/video-platform/internal/repository"
)

type SubscriptionService struct {
	subscriptionRepo *repository.SubscriptionRepository
	userRepo         *repository.UserRepository
}

func NewSubscriptionService(subscriptionRepo *repository.SubscriptionRepository, userRepo *repository.UserRepository) *SubscriptionService {
	return &SubscriptionService{
		subscriptionRepo: subscriptionRepo,
		userRepo:         userRepo,
	}
}

// Subscribe allows a user to subscribe to a channel
func (s *SubscriptionService) Subscribe(ctx context.Context, subscriberUserID, subscribedToUserID int64) error {
	// Prevent self-subscription
	if subscriberUserID == subscribedToUserID {
		return errors.New("cannot subscribe to yourself")
	}

	// Check if the target user exists
	_, err := s.userRepo.FindByID(ctx, subscribedToUserID)
	if err != nil {
		return errors.New("user not found")
	}

	// Create subscription
	if err := s.subscriptionRepo.Subscribe(ctx, subscriberUserID, subscribedToUserID); err != nil {
		return fmt.Errorf("failed to subscribe: %w", err)
	}

	return nil
}

// Unsubscribe allows a user to unsubscribe from a channel
func (s *SubscriptionService) Unsubscribe(ctx context.Context, subscriberUserID, subscribedToUserID int64) error {
	if err := s.subscriptionRepo.Unsubscribe(ctx, subscriberUserID, subscribedToUserID); err != nil {
		return fmt.Errorf("failed to unsubscribe: %w", err)
	}
	return nil
}

// IsSubscribed checks if a user is subscribed to a channel
func (s *SubscriptionService) IsSubscribed(ctx context.Context, subscriberUserID, subscribedToUserID int64) (bool, error) {
	isSubscribed, err := s.subscriptionRepo.IsSubscribed(ctx, subscriberUserID, subscribedToUserID)
	if err != nil {
		return false, fmt.Errorf("failed to check subscription status: %w", err)
	}
	return isSubscribed, nil
}

// GetSubscriberCount returns the subscriber count for a channel
func (s *SubscriptionService) GetSubscriberCount(ctx context.Context, userID int64) (int64, error) {
	count, err := s.subscriptionRepo.GetSubscriberCount(ctx, userID)
	if err != nil {
		return 0, fmt.Errorf("failed to get subscriber count: %w", err)
	}
	return count, nil
}

// GetSubscribedChannels returns the list of channels a user is subscribed to
func (s *SubscriptionService) GetSubscribedChannels(ctx context.Context, subscriberUserID int64) ([]*model.SubscriptionWithProfile, error) {
	subscriptions, err := s.subscriptionRepo.GetSubscribedChannels(ctx, subscriberUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get subscribed channels: %w", err)
	}
	return subscriptions, nil
}

// GetSubscriptionFeed returns videos from subscribed channels
func (s *SubscriptionService) GetSubscriptionFeed(ctx context.Context, subscriberUserID int64, limit, offset int) ([]*model.VideoWithProfile, error) {
	// Set default limit if not provided
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	videos, err := s.subscriptionRepo.GetSubscriptionFeed(ctx, subscriberUserID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get subscription feed: %w", err)
	}
	return videos, nil
}
