'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Video } from '@/types';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, CloudUpload as UploadIcon } from '@mui/icons-material';

export default function VideoEditPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Don't fetch if still loading auth or not authenticated
    if (authLoading || !isAuthenticated || !params.id) {
      return;
    }

    const fetchVideo = async () => {
      try {
        const data = await api.getVideo(Number(params.id));
        setVideo(data);
        setTitle(data.title);
        setDescription(data.description);
      } catch (err) {
        setError(err instanceof Error ? err.message : '動画の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [authLoading, isAuthenticated, params.id, router]);

  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setVideoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    } else {
      setVideoPreview(null);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setThumbnailFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !video) {
      setError('タイトルは必須です');
      return;
    }

    setError('');
    setUpdating(true);

    try {
      // Use FormData if files are being updated
      if (videoFile || thumbnailFile) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (videoFile) {
          formData.append('video', videoFile);
        }
        if (thumbnailFile) {
          formData.append('thumbnail', thumbnailFile);
        }
        await api.updateVideoWithFiles(video.id, formData);
      } else {
        // Use JSON if only updating text fields
        await api.updateVideo(video.id, { title, description });
      }
      router.push(`/videos/${video.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !video) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        動画を編集
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="説明"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            sx={{ mb: 3 }}
          />

          {/* Video File */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              動画ファイル
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              新しい動画を選択
              <input
                type="file"
                hidden
                accept="video/*"
                onChange={handleVideoChange}
              />
            </Button>
            {videoFile && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                選択: {videoFile.name}
              </Typography>
            )}
            {(videoPreview || video?.video_url) && (
              <Box
                component="video"
                src={videoPreview || video?.video_url}
                controls
                sx={{
                  width: '100%',
                  maxHeight: 400,
                  bgcolor: 'black',
                  borderRadius: 1,
                }}
              />
            )}
          </Box>

          {/* Thumbnail */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              サムネイル画像
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              新しいサムネイルを選択
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleThumbnailChange}
              />
            </Button>
            {thumbnailFile && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                選択: {thumbnailFile.name}
              </Typography>
            )}
            {(thumbnailPreview || video?.thumbnail_url) && (
              <Box
                component="img"
                src={thumbnailPreview || video?.thumbnail_url}
                alt="サムネイルプレビュー"
                sx={{
                  width: '100%',
                  maxHeight: 300,
                  objectFit: 'contain',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            )}
          </Box>

          {/* Submit */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={updating}
              startIcon={updating ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {updating ? '更新中...' : '更新'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.back()}
              disabled={updating}
              startIcon={<CancelIcon />}
            >
              キャンセル
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
