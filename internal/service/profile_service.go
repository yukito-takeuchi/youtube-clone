package service

import (
	"context"
	"fmt"
	"io"

	"github.com/yukito/video-platform/internal/model"
	"github.com/yukito/video-platform/internal/repository"
	"github.com/yukito/video-platform/internal/storage"
)

type ProfileService struct {
	profileRepo *repository.ProfileRepository
	storage     *storage.MinIOStorage
}

func NewProfileService(profileRepo *repository.ProfileRepository, storage *storage.MinIOStorage) *ProfileService {
	return &ProfileService{
		profileRepo: profileRepo,
		storage:     storage,
	}
}

func (s *ProfileService) GetByUserID(ctx context.Context, userID int64) (*model.Profile, error) {
	profile, err := s.profileRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to find profile: %w", err)
	}
	return profile, nil
}

func (s *ProfileService) Update(ctx context.Context, userID int64, req *model.UpdateProfileRequest) (*model.Profile, error) {
	// Get existing profile
	profile, err := s.profileRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("profile not found: %w", err)
	}

	// Update fields
	if req.ChannelName != "" {
		profile.ChannelName = req.ChannelName
	}
	if req.Description != "" {
		profile.Description = req.Description
	}

	// Update profile
	updatedProfile, err := s.profileRepo.Update(ctx, profile)
	if err != nil {
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}

	return updatedProfile, nil
}

func (s *ProfileService) UpdateWithFiles(
	ctx context.Context,
	userID int64,
	channelName, description string,
	iconFile io.Reader,
	iconFilename, iconContentType string,
	iconSize int64,
	bannerFile io.Reader,
	bannerFilename, bannerContentType string,
	bannerSize int64,
) (*model.Profile, error) {
	// Get existing profile
	profile, err := s.profileRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("profile not found: %w", err)
	}

	// Upload icon if provided
	if iconFile != nil {
		iconURL, err := s.storage.UploadFile(ctx, iconFile, iconFilename, iconContentType, iconSize)
		if err != nil {
			return nil, fmt.Errorf("failed to upload icon: %w", err)
		}
		// Delete old icon if exists
		if profile.IconURL != "" {
			_ = s.storage.DeleteFile(ctx, profile.IconURL)
		}
		profile.IconURL = iconURL
	}

	// Upload banner if provided
	if bannerFile != nil {
		bannerURL, err := s.storage.UploadFile(ctx, bannerFile, bannerFilename, bannerContentType, bannerSize)
		if err != nil {
			return nil, fmt.Errorf("failed to upload banner: %w", err)
		}
		// Delete old banner if exists
		if profile.BannerURL != "" {
			_ = s.storage.DeleteFile(ctx, profile.BannerURL)
		}
		profile.BannerURL = bannerURL
	}

	// Update text fields
	if channelName != "" {
		profile.ChannelName = channelName
	}
	if description != "" {
		profile.Description = description
	}

	// Update profile
	updatedProfile, err := s.profileRepo.Update(ctx, profile)
	if err != nil {
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}

	return updatedProfile, nil
}
