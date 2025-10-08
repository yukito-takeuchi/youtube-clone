'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Profile } from '@/types';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!authLoading && isAuthenticated) {
      const fetchProfile = async () => {
      try {
        const data = await api.getMyProfile();
        setProfile(data);
        setChannelName(data.channel_name);
        setDescription(data.description || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'プロフィールの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

      fetchProfile();
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUpdating(true);

    try {
      const formData = new FormData();
      formData.append('channel_name', channelName);
      formData.append('description', description);
      if (iconFile) {
        formData.append('icon', iconFile);
      }
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      const updated = await api.updateProfile(formData);
      setProfile(updated);
      setIsEditing(false);
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

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">プロフィールが見つかりません</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
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
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
            <Avatar
              src={profile.icon_url}
              sx={{ width: 100, height: 100, border: '4px solid white', mt: -8 }}
            />
            <Box sx={{ flex: 1 }}>
              {!isEditing ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4">{profile.channel_name}</Typography>
                    <Button
                      startIcon={<EditIcon />}
                      variant="outlined"
                      onClick={() => setIsEditing(true)}
                    >
                      編集
                    </Button>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    {profile.description || '説明はありません'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {user?.email}
                  </Typography>
                </>
              ) : (
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="チャンネル名"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="説明"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={3}
                    sx={{ mb: 2 }}
                  />

                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    アイコン画像を選択
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                    />
                  </Button>
                  {iconFile && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      選択: {iconFile.name}
                    </Typography>
                  )}

                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    バナー画像を選択
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                    />
                  </Button>
                  {bannerFile && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      選択: {bannerFile.name}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={updating}
                      fullWidth
                    >
                      {updating ? '更新中...' : '保存'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={() => {
                        setIsEditing(false);
                        setChannelName(profile.channel_name);
                        setDescription(profile.description || '');
                        setIconFile(null);
                        setBannerFile(null);
                        setError('');
                      }}
                      disabled={updating}
                      fullWidth
                    >
                      キャンセル
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
