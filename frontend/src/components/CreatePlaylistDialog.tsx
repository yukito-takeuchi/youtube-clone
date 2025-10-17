"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";

interface CreatePlaylistDialogProps {
  open: boolean;
  onClose: () => void;
  onCreatePlaylist: (title: string) => Promise<void>;
}

export default function CreatePlaylistDialog({
  open,
  onClose,
  onCreatePlaylist,
}: CreatePlaylistDialogProps) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (!loading) {
      setTitle("");
      setError("");
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onCreatePlaylist(title.trim());
      setTitle("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "プレイリストの作成に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Typography variant="h6" component="div">
            新しいプレイリスト
          </Typography>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            fullWidth
            label="タイトル"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            placeholder="プレイリストのタイトルを入力"
            inputProps={{ maxLength: 100 }}
            helperText={`${title.length}/100`}
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            キャンセル
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !title.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? "作成中..." : "作成"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
