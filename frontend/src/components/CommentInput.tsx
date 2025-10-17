'use client';

import { useState } from 'react';
import { Box, TextField, Button, Avatar, CircularProgress } from '@mui/material';
import { getIconUrl } from '@/lib/defaults';

interface CommentInputProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  userIconUrl?: string;
  autoFocus?: boolean;
}

export default function CommentInput({
  onSubmit,
  placeholder = 'コメントを追加...',
  userIconUrl,
  autoFocus = false,
}: CommentInputProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
      setIsFocused(false);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    setIsFocused(false);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <Avatar
        src={getIconUrl(userIconUrl)}
        sx={{ width: 40, height: 40, flexShrink: 0 }}
      >
        U
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={8}
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          autoFocus={autoFocus}
          disabled={isSubmitting}
          sx={{
            '& .MuiOutlinedInput-root': {
              padding: 0,
              '& fieldset': {
                border: 'none',
                borderBottom: isFocused ? '2px solid' : '1px solid',
                borderColor: isFocused ? 'primary.main' : 'divider',
                borderRadius: 0,
              },
              '&:hover fieldset': {
                borderBottom: '2px solid',
                borderColor: 'text.primary',
              },
              '&.Mui-focused fieldset': {
                borderBottom: '2px solid',
                borderColor: 'primary.main',
              },
            },
            '& .MuiOutlinedInput-input': {
              padding: '8px 0',
            },
          }}
        />
        {(isFocused || content.trim()) && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'flex-end',
              mt: 1,
            }}
          >
            <Button
              variant="text"
              onClick={handleCancel}
              disabled={isSubmitting}
              sx={{
                color: 'text.secondary',
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              キャンセル
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                minWidth: 80,
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                'コメント'
              )}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
