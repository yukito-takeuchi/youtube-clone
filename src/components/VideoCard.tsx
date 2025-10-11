import Link from 'next/link';
import { Video } from '@/types';
import { Card, CardMedia, CardContent, Typography, Box, Avatar } from '@mui/material';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: 'transparent',
      }}
    >
      {/* Thumbnail */}
      <Link href={`/videos/${video.id}`} style={{ textDecoration: 'none' }}>
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.9,
            }
          }}
        >
          {!video.thumbnail_url && (
            <Typography variant="body2" color="text.secondary" sx={{ position: 'absolute' }}>
              No Thumbnail
            </Typography>
          )}
        </CardMedia>
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
                }
              }}
            >
              {video.profile?.channel_name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </Link>

          {/* Video Details */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Link href={`/videos/${video.id}`} style={{ textDecoration: 'none' }}>
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
                  }
                }}
              >
                {video.title}
              </Typography>
            </Link>
            <Link href={`/profile/${video.user_id}`} style={{ textDecoration: 'none' }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'text.primary',
                  }
                }}
              >
                {video.profile?.channel_name || 'チャンネル名'}
              </Typography>
            </Link>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {video.view_count.toLocaleString()} 回視聴 •{' '}
              {new Date(video.created_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
