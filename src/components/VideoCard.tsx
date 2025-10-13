'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Video } from '@/types';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  WatchLater as WatchLaterIcon,
  PlaylistAdd as PlaylistAddIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import PlaylistDialog from './PlaylistDialog';
import { api } from '@/lib/api';

interface VideoCardProps {
  video: Video;
}

// Helper function to format duration (seconds to MM:SS or H:MM:SS)
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Helper function to format relative date
function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) {
    return `${diffYears}年前`;
  } else if (diffMonths > 0) {
    return `${diffMonths}ヶ月前`;
  } else if (diffWeeks > 0) {
    return `${diffWeeks}週間前`;
  } else if (diffDays > 0) {
    return `${diffDays}日前`;
  } else if (diffHours > 0) {
    return `${diffHours}時間前`;
  } else if (diffMins > 0) {
    return `${diffMins}分前`;
  } else {
    return '数秒前';
  }
}

export default function VideoCard({ video }: VideoCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleWatchLater = async () => {
    try {
      // Get user's playlists
      const playlists = await api.getUserPlaylists();

      // Find "Watch Later" playlist
      const watchLaterPlaylist = playlists.find((p) => p.title === 'あとで見る');

      if (watchLaterPlaylist) {
        // Add video to watch later playlist
        await api.addVideoToPlaylist(watchLaterPlaylist.id, video.id);
        console.log('Added to Watch Later');
      } else {
        console.error('Watch Later playlist not found');
      }
    } catch (err) {
      console.error('Failed to add to Watch Later:', err);
    }
    handleMenuClose();
  };

  const handleSaveToPlaylist = () => {
    setPlaylistDialogOpen(true);
    handleMenuClose();
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share video:', video.id);
    handleMenuClose();
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log('Download video:', video.id);
    handleMenuClose();
  };

  const handleReport = () => {
    // TODO: Implement report functionality
    console.log('Report video:', video.id);
    handleMenuClose();
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          bgcolor: 'transparent',
        }}
      >
        {/* Thumbnail */}
        <Link href={`/videos/${video.id}`} style={{ textDecoration: 'none' }}>
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="div"
              className="thumbnail"
              sx={{
                paddingTop: '56.25%', // 16:9 aspect ratio
                borderRadius: 2,
                bgcolor: 'grey.300',
                backgroundImage: video.thumbnail_url ? `url(${video.thumbnail_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'opacity 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.9,
                },
              }}
            />
            {!video.thumbnail_url && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No Thumbnail
                </Typography>
              </Box>
            )}
            {/* Duration overlay */}
            {video.duration && video.duration > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  bgcolor: 'rgba(0, 0, 0, 0.9)',
                  color: 'white',
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                {formatDuration(video.duration)}
              </Box>
            )}
          </Box>
        </Link>

        {/* Info */}
        <CardContent sx={{ px: 0, py: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {/* Channel Avatar - Clickable */}
            <Link href={`/profile/${video.user_id}`} style={{ textDecoration: 'none' }}>
              <Avatar
                src={video.profile?.icon_url}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                  flexShrink: 0,
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                {video.profile?.channel_name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </Link>

            {/* Video Details */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                <Link href={`/videos/${video.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 500,
                      mb: 0.5,
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      color: 'text.primary',
                      cursor: 'pointer',
                      '&:hover': {
                        color: 'text.secondary',
                      },
                    }}
                  >
                    {video.title}
                  </Typography>
                </Link>
                <IconButton
                  size="small"
                  onClick={handleMenuClick}
                  sx={{
                    mt: -0.5,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              <Link href={`/profile/${video.user_id}`} style={{ textDecoration: 'none' }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'text.primary',
                    },
                  }}
                >
                  {video.profile?.channel_name || 'チャンネル名'}
                </Typography>
              </Link>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {video.view_count.toLocaleString()} 回視聴 • {getRelativeTime(video.created_at)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            minWidth: 240,
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          },
        }}
      >
        <MenuItem onClick={handleWatchLater}>
          <ListItemIcon>
            <WatchLaterIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>あとで見る</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSaveToPlaylist}>
          <ListItemIcon>
            <PlaylistAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>再生リストに保存</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleShare}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>共有</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDownload}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>ダウンロード</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleReport}>
          <ListItemIcon>
            <FlagIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>報告</ListItemText>
        </MenuItem>
      </Menu>

      {/* Playlist Dialog */}
      <PlaylistDialog
        open={playlistDialogOpen}
        onClose={() => setPlaylistDialogOpen(false)}
        videoId={video.id}
        videoTitle={video.title}
      />
    </>
  );
}
