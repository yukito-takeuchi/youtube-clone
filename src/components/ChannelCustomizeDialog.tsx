'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Slider,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, Check as CheckIcon } from '@mui/icons-material';
import Cropper, { Area } from 'react-easy-crop';
import { Profile } from '@/types';
import { api } from '@/lib/api';
import { getCroppedImg, readFile } from '@/lib/cropImage';

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
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  // Icon crop states
  const [iconSrc, setIconSrc] = useState<string | null>(null);
  const [iconCrop, setIconCrop] = useState({ x: 0, y: 0 });
  const [iconZoom, setIconZoom] = useState(1);
  const [iconCroppedAreaPixels, setIconCroppedAreaPixels] = useState<Area | null>(null);
  const [showIconCropper, setShowIconCropper] = useState(false);

  // Banner crop states
  const [bannerSrc, setBannerSrc] = useState<string | null>(null);
  const [bannerCrop, setBannerCrop] = useState({ x: 0, y: 0 });
  const [bannerZoom, setBannerZoom] = useState(1);
  const [bannerCroppedAreaPixels, setBannerCroppedAreaPixels] = useState<Area | null>(null);
  const [showBannerCropper, setShowBannerCropper] = useState(false);

  useEffect(() => {
    if (open) {
      setChannelName(profile.channel_name);
      setDescription(profile.description || '');
      setIconFile(null);
      setBannerFile(null);
      setIconPreview(null);
      setBannerPreview(null);
      setError('');
    }
  }, [open, profile]);

  const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageDataUrl = await readFile(file);
      setIconSrc(imageDataUrl);
      setShowIconCropper(true);
      setIconCrop({ x: 0, y: 0 });
      setIconZoom(1);
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageDataUrl = await readFile(file);
      setBannerSrc(imageDataUrl);
      setShowBannerCropper(true);
      setBannerCrop({ x: 0, y: 0 });
      setBannerZoom(1);
    }
  };

  const onIconCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setIconCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onBannerCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setBannerCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleIconCropConfirm = async () => {
    if (!iconSrc || !iconCroppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(iconSrc, iconCroppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'icon.jpg', { type: 'image/jpeg' });
      setIconFile(croppedFile);
      setIconPreview(URL.createObjectURL(croppedBlob));
      setShowIconCropper(false);
      setIconSrc(null);
    } catch (error) {
      console.error('Error cropping icon:', error);
      setError('アイコンのクロップに失敗しました');
    }
  };

  const handleBannerCropConfirm = async () => {
    if (!bannerSrc || !bannerCroppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(bannerSrc, bannerCroppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'banner.jpg', { type: 'image/jpeg' });
      setBannerFile(croppedFile);
      setBannerPreview(URL.createObjectURL(croppedBlob));
      setShowBannerCropper(false);
      setBannerSrc(null);
    } catch (error) {
      console.error('Error cropping banner:', error);
      setError('バナーのクロップに失敗しました');
    }
  };

  const handleIconCropCancel = () => {
    setShowIconCropper(false);
    setIconSrc(null);
    setIconCrop({ x: 0, y: 0 });
    setIconZoom(1);
  };

  const handleBannerCropCancel = () => {
    setShowBannerCropper(false);
    setBannerSrc(null);
    setBannerCrop({ x: 0, y: 0 });
    setBannerZoom(1);
  };

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

      // Update localStorage to reflect changes in header icon
      if (typeof window !== 'undefined') {
        localStorage.setItem('profile', JSON.stringify(updated));
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
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

          {/* Icon */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              アイコン画像
            </Typography>
            <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
              アイコン画像を選択
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleIconChange}
              />
            </Button>
            {iconFile && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                選択: {iconFile.name}
              </Typography>
            )}
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid',
                borderColor: 'divider',
                mx: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.200',
              }}
            >
              {iconPreview || profile.icon_url ? (
                <Box
                  component="img"
                  src={iconPreview || profile.icon_url}
                  alt="アイコンプレビュー"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Typography variant="h3" color="text.secondary">
                  {profile.channel_name?.[0]?.toUpperCase() || 'U'}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Banner */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              バナー画像
            </Typography>
            <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
              バナー画像を選択
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleBannerChange}
              />
            </Button>
            {bannerFile && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                選択: {bannerFile.name}
              </Typography>
            )}
            <Box
              sx={{
                width: '100%',
                height: 150,
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.200',
              }}
            >
              {bannerPreview || profile.banner_url ? (
                <Box
                  component="img"
                  src={bannerPreview || profile.banner_url}
                  alt="バナープレビュー"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  バナー画像なし
                </Typography>
              )}
            </Box>
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

    {/* Icon Cropper Dialog */}
    <Dialog open={showIconCropper} onClose={handleIconCropCancel} maxWidth="md" fullWidth>
      <DialogTitle>アイコンを調整</DialogTitle>
      <DialogContent>
        <Box sx={{ position: 'relative', width: '100%', height: 400, bgcolor: 'black' }}>
          {iconSrc && (
            <Cropper
              image={iconSrc}
              crop={iconCrop}
              zoom={iconZoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setIconCrop}
              onZoomChange={setIconZoom}
              onCropComplete={onIconCropComplete}
            />
          )}
        </Box>
        <Box sx={{ mt: 3, px: 2 }}>
          <Typography variant="body2" gutterBottom>
            ズーム
          </Typography>
          <Slider
            value={iconZoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(_, value) => setIconZoom(value as number)}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleIconCropCancel} startIcon={<CancelIcon />}>
          キャンセル
        </Button>
        <Button
          onClick={handleIconCropConfirm}
          variant="contained"
          startIcon={<CheckIcon />}
        >
          確定
        </Button>
      </DialogActions>
    </Dialog>

    {/* Banner Cropper Dialog */}
    <Dialog open={showBannerCropper} onClose={handleBannerCropCancel} maxWidth="md" fullWidth>
      <DialogTitle>バナーを調整</DialogTitle>
      <DialogContent>
        <Box sx={{ position: 'relative', width: '100%', height: 400, bgcolor: 'black' }}>
          {bannerSrc && (
            <Cropper
              image={bannerSrc}
              crop={bannerCrop}
              zoom={bannerZoom}
              aspect={16 / 9}
              cropShape="rect"
              showGrid={true}
              onCropChange={setBannerCrop}
              onZoomChange={setBannerZoom}
              onCropComplete={onBannerCropComplete}
            />
          )}
        </Box>
        <Box sx={{ mt: 3, px: 2 }}>
          <Typography variant="body2" gutterBottom>
            ズーム
          </Typography>
          <Slider
            value={bannerZoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(_, value) => setBannerZoom(value as number)}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleBannerCropCancel} startIcon={<CancelIcon />}>
          キャンセル
        </Button>
        <Button
          onClick={handleBannerCropConfirm}
          variant="contained"
          startIcon={<CheckIcon />}
        >
          確定
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}
