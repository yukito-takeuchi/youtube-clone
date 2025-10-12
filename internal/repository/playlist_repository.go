package repository

import (
	"context"
	"database/sql"

	"github.com/yukito/video-platform/internal/database"
	"github.com/yukito/video-platform/internal/model"
)

type PlaylistRepository struct {
	db *database.Database
}

func NewPlaylistRepository(db *database.Database) *PlaylistRepository {
	return &PlaylistRepository{db: db}
}

// Create creates a new playlist
func (r *PlaylistRepository) Create(ctx context.Context, playlist *model.Playlist) (*model.Playlist, error) {
	query := `
		INSERT INTO playlists (user_id, title, description, visibility)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
	`

	err := r.db.Pool.QueryRow(
		ctx,
		query,
		playlist.UserID,
		playlist.Title,
		playlist.Description,
		playlist.Visibility,
	).Scan(&playlist.ID, &playlist.CreatedAt, &playlist.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return playlist, nil
}

// FindByID finds a playlist by ID
func (r *PlaylistRepository) FindByID(ctx context.Context, id int64) (*model.Playlist, error) {
	query := `
		SELECT p.id, p.user_id, p.title, p.description, p.visibility, p.created_at, p.updated_at,
		       COUNT(pv.id) as video_count
		FROM playlists p
		LEFT JOIN playlist_videos pv ON p.id = pv.playlist_id
		WHERE p.id = $1
		GROUP BY p.id
	`

	var playlist model.Playlist
	err := r.db.Pool.QueryRow(ctx, query, id).Scan(
		&playlist.ID,
		&playlist.UserID,
		&playlist.Title,
		&playlist.Description,
		&playlist.Visibility,
		&playlist.CreatedAt,
		&playlist.UpdatedAt,
		&playlist.VideoCount,
	)

	if err != nil {
		return nil, err
	}

	return &playlist, nil
}

// FindByUserID finds all playlists for a user
func (r *PlaylistRepository) FindByUserID(ctx context.Context, userID int64) ([]*model.Playlist, error) {
	query := `
		SELECT p.id, p.user_id, p.title, p.description, p.visibility, p.created_at, p.updated_at,
		       COUNT(pv.id) as video_count
		FROM playlists p
		LEFT JOIN playlist_videos pv ON p.id = pv.playlist_id
		WHERE p.user_id = $1
		GROUP BY p.id
		ORDER BY p.updated_at DESC
	`

	rows, err := r.db.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var playlists []*model.Playlist
	for rows.Next() {
		var playlist model.Playlist
		err := rows.Scan(
			&playlist.ID,
			&playlist.UserID,
			&playlist.Title,
			&playlist.Description,
			&playlist.Visibility,
			&playlist.CreatedAt,
			&playlist.UpdatedAt,
			&playlist.VideoCount,
		)
		if err != nil {
			return nil, err
		}
		playlists = append(playlists, &playlist)
	}

	return playlists, nil
}

// Update updates a playlist
func (r *PlaylistRepository) Update(ctx context.Context, playlist *model.Playlist) (*model.Playlist, error) {
	query := `
		UPDATE playlists
		SET title = $1, description = $2, visibility = $3, updated_at = CURRENT_TIMESTAMP
		WHERE id = $4
		RETURNING updated_at
	`

	err := r.db.Pool.QueryRow(
		ctx,
		query,
		playlist.Title,
		playlist.Description,
		playlist.Visibility,
		playlist.ID,
	).Scan(&playlist.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return playlist, nil
}

// Delete deletes a playlist
func (r *PlaylistRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM playlists WHERE id = $1`
	_, err := r.db.Pool.Exec(ctx, query, id)
	return err
}

// AddVideo adds a video to a playlist
func (r *PlaylistRepository) AddVideo(ctx context.Context, playlistID, videoID int64) error {
	// Get the next position
	var maxPosition sql.NullInt64
	posQuery := `SELECT MAX(position) FROM playlist_videos WHERE playlist_id = $1`
	err := r.db.Pool.QueryRow(ctx, posQuery, playlistID).Scan(&maxPosition)
	if err != nil {
		return err
	}

	position := 0
	if maxPosition.Valid {
		position = int(maxPosition.Int64) + 1
	}

	// Insert the video
	query := `
		INSERT INTO playlist_videos (playlist_id, video_id, position)
		VALUES ($1, $2, $3)
		ON CONFLICT (playlist_id, video_id) DO NOTHING
	`
	_, err = r.db.Pool.Exec(ctx, query, playlistID, videoID, position)
	return err
}

// RemoveVideo removes a video from a playlist
func (r *PlaylistRepository) RemoveVideo(ctx context.Context, playlistID, videoID int64) error {
	query := `DELETE FROM playlist_videos WHERE playlist_id = $1 AND video_id = $2`
	_, err := r.db.Pool.Exec(ctx, query, playlistID, videoID)
	return err
}

// IsVideoInPlaylist checks if a video is in a playlist
func (r *PlaylistRepository) IsVideoInPlaylist(ctx context.Context, playlistID, videoID int64) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM playlist_videos WHERE playlist_id = $1 AND video_id = $2)`
	var exists bool
	err := r.db.Pool.QueryRow(ctx, query, playlistID, videoID).Scan(&exists)
	return exists, err
}

// GetPlaylistVideos gets all videos in a playlist
func (r *PlaylistRepository) GetPlaylistVideos(ctx context.Context, playlistID int64) ([]*model.PlaylistVideo, error) {
	query := `
		SELECT pv.id, pv.playlist_id, pv.video_id, pv.position, pv.created_at,
		       v.id, v.user_id, v.title, v.description, v.video_url, v.thumbnail_url, v.view_count, v.created_at, v.updated_at
		FROM playlist_videos pv
		JOIN videos v ON pv.video_id = v.id
		WHERE pv.playlist_id = $1
		ORDER BY pv.created_at DESC
	`

	rows, err := r.db.Pool.Query(ctx, query, playlistID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var playlistVideos []*model.PlaylistVideo
	for rows.Next() {
		var pv model.PlaylistVideo
		var video model.Video

		err := rows.Scan(
			&pv.ID,
			&pv.PlaylistID,
			&pv.VideoID,
			&pv.Position,
			&pv.CreatedAt,
			&video.ID,
			&video.UserID,
			&video.Title,
			&video.Description,
			&video.VideoURL,
			&video.ThumbnailURL,
			&video.ViewCount,
			&video.CreatedAt,
			&video.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Convert Video to VideoWithProfile (without profile for now)
		videoWithProfile := &model.VideoWithProfile{
			ID:           video.ID,
			UserID:       video.UserID,
			Title:        video.Title,
			Description:  video.Description,
			VideoURL:     video.VideoURL,
			ThumbnailURL: video.ThumbnailURL,
			ViewCount:    video.ViewCount,
			CreatedAt:    video.CreatedAt,
			UpdatedAt:    video.UpdatedAt,
		}

		pv.Video = videoWithProfile
		playlistVideos = append(playlistVideos, &pv)
	}

	return playlistVideos, nil
}

// GetPlaylistsContainingVideo gets all playlists that contain a specific video for a user
func (r *PlaylistRepository) GetPlaylistsContainingVideo(ctx context.Context, userID, videoID int64) ([]int64, error) {
	query := `
		SELECT p.id
		FROM playlists p
		JOIN playlist_videos pv ON p.id = pv.playlist_id
		WHERE p.user_id = $1 AND pv.video_id = $2
	`

	rows, err := r.db.Pool.Query(ctx, query, userID, videoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var playlistIDs []int64
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		playlistIDs = append(playlistIDs, id)
	}

	return playlistIDs, nil
}

// FindLikedPlaylistByUserID finds the "Liked Videos" playlist for a user
func (r *PlaylistRepository) FindLikedPlaylistByUserID(ctx context.Context, userID int64) (*model.Playlist, error) {
	query := `
		SELECT id, user_id, title, description, visibility, created_at, updated_at
		FROM playlists
		WHERE user_id = $1 AND title = '高く評価した動画'
		LIMIT 1
	`

	var playlist model.Playlist
	err := r.db.Pool.QueryRow(ctx, query, userID).Scan(
		&playlist.ID,
		&playlist.UserID,
		&playlist.Title,
		&playlist.Description,
		&playlist.Visibility,
		&playlist.CreatedAt,
		&playlist.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &playlist, nil
}
