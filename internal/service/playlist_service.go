package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/yukito/video-platform/internal/model"
	"github.com/yukito/video-platform/internal/repository"
)

type PlaylistService struct {
	playlistRepo *repository.PlaylistRepository
	videoRepo    *repository.VideoRepository
}

func NewPlaylistService(playlistRepo *repository.PlaylistRepository, videoRepo *repository.VideoRepository) *PlaylistService {
	return &PlaylistService{
		playlistRepo: playlistRepo,
		videoRepo:    videoRepo,
	}
}

func (s *PlaylistService) Create(ctx context.Context, userID int64, req *model.CreatePlaylistRequest) (*model.Playlist, error) {
	// Set default visibility if not provided
	visibility := req.Visibility
	if visibility == "" {
		visibility = "private"
	}

	// Validate visibility
	if visibility != "public" && visibility != "unlisted" && visibility != "private" {
		return nil, errors.New("invalid visibility value")
	}

	playlist := &model.Playlist{
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		Visibility:  visibility,
	}

	createdPlaylist, err := s.playlistRepo.Create(ctx, playlist)
	if err != nil {
		return nil, fmt.Errorf("failed to create playlist: %w", err)
	}

	return createdPlaylist, nil
}

func (s *PlaylistService) GetByID(ctx context.Context, id int64) (*model.Playlist, error) {
	playlist, err := s.playlistRepo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to find playlist: %w", err)
	}

	return playlist, nil
}

func (s *PlaylistService) GetUserPlaylists(ctx context.Context, userID int64) ([]*model.Playlist, error) {
	playlists, err := s.playlistRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to find user playlists: %w", err)
	}

	return playlists, nil
}

func (s *PlaylistService) Update(ctx context.Context, userID, playlistID int64, req *model.UpdatePlaylistRequest) (*model.Playlist, error) {
	// Check if playlist exists and belongs to user
	existingPlaylist, err := s.playlistRepo.FindByID(ctx, playlistID)
	if err != nil {
		return nil, fmt.Errorf("playlist not found: %w", err)
	}

	if existingPlaylist.UserID != userID {
		return nil, errors.New("unauthorized to update this playlist")
	}

	// Update only provided fields
	if req.Title != "" {
		existingPlaylist.Title = req.Title
	}
	if req.Description != "" {
		existingPlaylist.Description = req.Description
	}
	if req.Visibility != "" {
		// Validate visibility
		if req.Visibility != "public" && req.Visibility != "unlisted" && req.Visibility != "private" {
			return nil, errors.New("invalid visibility value")
		}
		existingPlaylist.Visibility = req.Visibility
	}

	updatedPlaylist, err := s.playlistRepo.Update(ctx, existingPlaylist)
	if err != nil {
		return nil, fmt.Errorf("failed to update playlist: %w", err)
	}

	return updatedPlaylist, nil
}

func (s *PlaylistService) Delete(ctx context.Context, userID, playlistID int64) error {
	// Check if playlist exists and belongs to user
	existingPlaylist, err := s.playlistRepo.FindByID(ctx, playlistID)
	if err != nil {
		return fmt.Errorf("playlist not found: %w", err)
	}

	if existingPlaylist.UserID != userID {
		return errors.New("unauthorized to delete this playlist")
	}

	if err := s.playlistRepo.Delete(ctx, playlistID); err != nil {
		return fmt.Errorf("failed to delete playlist: %w", err)
	}

	return nil
}

func (s *PlaylistService) AddVideo(ctx context.Context, userID, playlistID, videoID int64) error {
	// Check if playlist exists and belongs to user
	playlist, err := s.playlistRepo.FindByID(ctx, playlistID)
	if err != nil {
		return fmt.Errorf("playlist not found: %w", err)
	}

	if playlist.UserID != userID {
		return errors.New("unauthorized to add video to this playlist")
	}

	// Check if video exists
	_, err = s.videoRepo.FindByID(ctx, videoID)
	if err != nil {
		return fmt.Errorf("video not found: %w", err)
	}

	// Add video to playlist
	if err := s.playlistRepo.AddVideo(ctx, playlistID, videoID); err != nil {
		return fmt.Errorf("failed to add video to playlist: %w", err)
	}

	return nil
}

func (s *PlaylistService) RemoveVideo(ctx context.Context, userID, playlistID, videoID int64) error {
	// Check if playlist exists and belongs to user
	playlist, err := s.playlistRepo.FindByID(ctx, playlistID)
	if err != nil {
		return fmt.Errorf("playlist not found: %w", err)
	}

	if playlist.UserID != userID {
		return errors.New("unauthorized to remove video from this playlist")
	}

	// Remove video from playlist
	if err := s.playlistRepo.RemoveVideo(ctx, playlistID, videoID); err != nil {
		return fmt.Errorf("failed to remove video from playlist: %w", err)
	}

	return nil
}

func (s *PlaylistService) GetPlaylistVideos(ctx context.Context, playlistID int64) ([]*model.PlaylistVideo, error) {
	// Check if playlist exists
	_, err := s.playlistRepo.FindByID(ctx, playlistID)
	if err != nil {
		return nil, fmt.Errorf("playlist not found: %w", err)
	}

	videos, err := s.playlistRepo.GetPlaylistVideos(ctx, playlistID)
	if err != nil {
		return nil, fmt.Errorf("failed to get playlist videos: %w", err)
	}

	return videos, nil
}

func (s *PlaylistService) GetPlaylistsContainingVideo(ctx context.Context, userID, videoID int64) ([]int64, error) {
	playlistIDs, err := s.playlistRepo.GetPlaylistsContainingVideo(ctx, userID, videoID)
	if err != nil {
		return nil, fmt.Errorf("failed to get playlists containing video: %w", err)
	}

	return playlistIDs, nil
}
