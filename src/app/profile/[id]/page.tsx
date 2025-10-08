'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Profile, Video } from '@/types';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import VideoCard from '@/components/VideoCard';

export default function ProfileDetailPage() {
  const params = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = Number(params.id);
        const profileData = await api.getProfile(userId);
        setProfile(profileData);

        // Get all videos and filter by user
        const allVideos = await api.getVideos();
        const userVideos = allVideos.filter(v => v.user_id === userId);
        setVideos(userVideos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'プロフィールの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'プロフィールが見つかりません'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ overflow: 'hidden', mb: 4 }}>
        {/* Banner */}
        <Box
          sx={{
            height: 200,
            bgcolor: 'grey.300',
            backgroundImage: profile.banner_url ? `url(${profile.banner_url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Profile Info */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
            <Avatar
              src={profile.icon_url}
              sx={{ width: 100, height: 100, border: '4px solid white', mt: -8 }}
            />
            <Box>
              <Typography variant="h4">{profile.channel_name}</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {profile.description || '説明はありません'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Videos */}
      <Typography variant="h5" sx={{ mb: 3 }}>
        アップロード動画
      </Typography>

      {videos.length === 0 ? (
        <Alert severity="info">まだ動画がありません</Alert>
      ) : (
        <Grid container spacing={2}>
          {videos.map((video) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
              <VideoCard video={video} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
