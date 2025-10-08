'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Video } from '@/types';
import { api } from '@/lib/api';
import VideoPlayer from '@/components/VideoPlayer';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Button,
  Avatar,
  Divider,
  TextField,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Share as ShareIcon,
  PlaylistAdd as PlaylistAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Link from 'next/link';

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const data = await api.getVideo(Number(params.id));
        setVideo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '動画の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchVideo();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!video || !confirm('この動画を削除しますか？')) return;

    try {
      await api.deleteVideo(video.id);
      router.push('/');
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography>読み込み中...</Typography>
      </Container>
    );
  }

  if (error || !video) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography color="error">{error || '動画が見つかりません'}</Typography>
      </Container>
    );
  }

  const isOwner = isAuthenticated && user && video.user_id === user.id;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Main Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Video Player */}
          <VideoPlayer videoUrl={video.video_url} title={video.title} />

          {/* Video Title */}
          <Typography variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
            {video.title}
          </Typography>

          {/* Actions Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {video.view_count.toLocaleString()} 回視聴 •{' '}
              {new Date(video.created_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Like/Dislike */}
              <Box sx={{ display: 'flex', bgcolor: 'action.hover', borderRadius: 50, overflow: 'hidden' }}>
                <IconButton size="small" sx={{ borderRadius: 0 }}>
                  <ThumbUpIcon fontSize="small" />
                  <Typography variant="body2" sx={{ ml: 1, mr: 1 }}>
                    0
                  </Typography>
                </IconButton>
                <Divider orientation="vertical" flexItem />
                <IconButton size="small" sx={{ borderRadius: 0 }}>
                  <ThumbDownIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Share */}
              <IconButton sx={{ bgcolor: 'action.hover', borderRadius: 50 }}>
                <ShareIcon fontSize="small" />
                <Typography variant="body2" sx={{ ml: 1, mr: 1 }}>
                  共有
                </Typography>
              </IconButton>

              {/* Save to Playlist */}
              <IconButton sx={{ bgcolor: 'action.hover', borderRadius: 50 }}>
                <PlaylistAddIcon fontSize="small" />
                <Typography variant="body2" sx={{ ml: 1, mr: 1 }}>
                  保存
                </Typography>
              </IconButton>
            </Box>
          </Box>

          <Divider />

          {/* Channel Info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Link
              href={`/profile/${video.user_id}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <Avatar
                src={video.profile?.icon_url}
                sx={{ width: 40, height: 40, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
              >
                {video.profile?.channel_name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
                  {video.profile?.channel_name || 'チャンネル名'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  登録者数 0人
                </Typography>
              </Box>
            </Link>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {!isOwner && (
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: 'text.primary',
                    color: 'background.paper',
                    borderRadius: 50,
                    px: 3,
                    '&:hover': { bgcolor: 'text.secondary' },
                  }}
                >
                  登録
                </Button>
              )}

              {isOwner && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => router.push(`/videos/${video.id}/edit`)}
                    sx={{ borderRadius: 50 }}
                  >
                    編集
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                    sx={{ borderRadius: 50 }}
                  >
                    削除
                  </Button>
                </>
              )}
            </Box>
          </Box>

          <Divider />

          {/* Description */}
          <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2, mt: 2 }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {video.description || '説明はありません'}
            </Typography>
          </Box>

          {/* Comments Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              コメント • 0
            </Typography>

            {/* Comment Input */}
            {isAuthenticated && (
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 40, height: 40 }}>
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <TextField
                  fullWidth
                  placeholder="コメントを追加..."
                  variant="standard"
                  disabled
                />
              </Box>
            )}

            {/* Comments List */}
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              コメント機能は未実装です
            </Typography>
          </Box>
        </Box>

        {/* Sidebar - Related Videos */}
        <Box sx={{ width: 400, display: { xs: 'none', lg: 'block' } }}>
          <Typography variant="body2" color="text.secondary">
            関連動画（未実装）
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
