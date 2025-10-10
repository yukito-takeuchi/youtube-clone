'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Profile, Video } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  VideoLibrary as VideoLibraryIcon,
  AddCircleOutline as AddCircleIcon,
} from '@mui/icons-material';
import VideoCard from '@/components/VideoCard';
import ChannelCustomizeDialog from '@/components/ChannelCustomizeDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);

  const userId = Number(params.id);
  const isOwnChannel = user?.id === userId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await api.getProfile(userId);
        setProfile(profileData);

        // Get all videos and filter by user
        const allVideos = await api.getVideos();
        const userVideos = allVideos.filter((v) => v.user_id === userId);
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
  }, [params.id, userId]);

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

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
      <Paper elevation={0} sx={{ overflow: 'hidden', mb: 2 }}>
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
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 2 }}>
            <Avatar src={profile.icon_url} sx={{ width: 100, height: 100, border: '4px solid white', mt: -8 }}>
              {profile.channel_name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {profile.channel_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                登録者 0人 • 動画 {videos.length}本
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {profile.description || '説明はありません'}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            {isOwnChannel ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => setCustomizeDialogOpen(true)}
                >
                  チャンネルをカスタマイズ
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<VideoLibraryIcon />}
                  onClick={() => router.push('/videos/upload')}
                >
                  動画を管理
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddCircleIcon />}
                  onClick={() => router.push('/videos/upload')}
                >
                  動画をアップロード
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                sx={{
                  bgcolor: 'text.primary',
                  color: 'background.paper',
                  '&:hover': { bgcolor: 'text.secondary' },
                }}
              >
                登録
              </Button>
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ borderTop: 1, borderColor: 'divider' }}>
          <Tab label="ホーム" />
          <Tab label="動画" />
          <Tab label="概要" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        {/* Home Tab - Videos */}
        {videos.length === 0 ? (
          <Alert severity="info">まだ動画がありません</Alert>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Videos Tab */}
        {videos.length === 0 ? (
          <Alert severity="info">まだ動画がありません</Alert>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* About Tab */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            説明
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {profile.description || '説明はありません'}
          </Typography>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            統計情報
          </Typography>
          <Typography variant="body2" color="text.secondary">
            登録者数: 0人
          </Typography>
          <Typography variant="body2" color="text.secondary">
            動画数: {videos.length}本
          </Typography>
          <Typography variant="body2" color="text.secondary">
            総視聴回数: {videos.reduce((sum, v) => sum + v.view_count, 0).toLocaleString()}回
          </Typography>
          <Typography variant="body2" color="text.secondary">
            チャンネル登録日: {new Date(profile.created_at).toLocaleDateString('ja-JP')}
          </Typography>
        </Paper>
      </TabPanel>

      {/* Customize Dialog */}
      {isOwnChannel && (
        <ChannelCustomizeDialog
          open={customizeDialogOpen}
          onClose={() => setCustomizeDialogOpen(false)}
          profile={profile}
          onUpdate={handleProfileUpdate}
        />
      )}
    </Container>
  );
}
