'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { Profile } from '@/types';
import { api } from '@/lib/api';

interface ChannelCustomizeDialogProps {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  onUpdate: (updatedProfile: Profile) => void;
}

export default function ChannelCustomizeDialog({
  open,
  onClose,
  profile,
  onUpdate,
}: ChannelCustomizeDialogProps) {
  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setChannelName(profile.channel_name);
      setDescription(profile.description || '');
      setIconFile(null);
      setBannerFile(null);
      setError('');
    }
  }, [open, profile]);

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
      onUpdate(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>チャンネルをカスタマイズ</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
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
            rows={4}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Button variant="outlined" component="label" fullWidth>
              アイコン画像を選択
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setIconFile(e.target.files?.[0] || null)}
              />
            </Button>
            {iconFile && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                選択: {iconFile.name}
              </Typography>
            )}
          </Box>

          <Box>
            <Button variant="outlined" component="label" fullWidth>
              バナー画像を選択
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
              />
            </Button>
            {bannerFile && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                選択: {bannerFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={updating} startIcon={<CancelIcon />}>
            キャンセル
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updating}
            startIcon={<SaveIcon />}
          >
            {updating ? '更新中...' : '保存'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
