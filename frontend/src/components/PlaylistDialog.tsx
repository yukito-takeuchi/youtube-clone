"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  PlaylistPlay as PlaylistIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Playlist } from "@/types";
import { api } from "@/lib/api";
import CreatePlaylistDialog from "@/components/CreatePlaylistDialog";

interface PlaylistDialogProps {
  open: boolean;
  onClose: () => void;
  videoId: number;
  videoTitle: string;
}

export default function PlaylistDialog({
  open,
  onClose,
  videoId,
  videoTitle,
}: PlaylistDialogProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistsWithVideo, setPlaylistsWithVideo] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updatingPlaylist, setUpdatingPlaylist] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [playlistsData, containingPlaylists] = await Promise.all([
        api.getUserPlaylists(),
        api.getPlaylistsContainingVideo(videoId),
      ]);
      setPlaylists(playlistsData);
      // containingPlaylistsが配列であることを保証
      setPlaylistsWithVideo(
        Array.isArray(containingPlaylists) ? containingPlaylists : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "プレイリストの読み込みに失敗しました"
      );
      // エラー時も空配列で初期化
      setPlaylistsWithVideo([]);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    if (open) {
      fetchData();
    } else {
      // ダイアログが閉じられた時に状態をリセット
      setError("");
      setUpdatingPlaylist(null);
    }
  }, [open, fetchData]);

  const handleTogglePlaylist = async (playlist: Playlist) => {
    if (updatingPlaylist === playlist.id) return;

    setUpdatingPlaylist(playlist.id);
    setError("");

    try {
      const isInPlaylist =
        Array.isArray(playlistsWithVideo) &&
        playlistsWithVideo.includes(playlist.id);

      if (isInPlaylist) {
        // プレイリストから削除
        await api.removeVideoFromPlaylist(playlist.id, videoId);
        setPlaylistsWithVideo((prev) =>
          prev.filter((id) => id !== playlist.id)
        );
      } else {
        // プレイリストに追加（YouTubeと同じ挙動：一度削除してから追加することで最新順になる）
        try {
          // 既に存在する場合は削除してから追加
          await api.removeVideoFromPlaylist(playlist.id, videoId);
        } catch {
          // 存在しない場合は無視
        }
        await api.addVideoToPlaylist(playlist.id, videoId);
        setPlaylistsWithVideo((prev) => {
          // 重複を避けて追加
          const filtered = prev.filter((id) => id !== playlist.id);
          return [...filtered, playlist.id];
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作に失敗しました");
    } finally {
      setUpdatingPlaylist(null);
    }
  };

  const handleCreatePlaylist = useCallback(
    async (title: string) => {
      try {
        const newPlaylist = await api.createPlaylist({
          title,
          visibility: "private",
        });

        // 新しいプレイリストに動画を追加
        await api.addVideoToPlaylist(newPlaylist.id, videoId);

        // 状態を更新
        setPlaylists((prev) => [newPlaylist, ...prev]);
        setPlaylistsWithVideo((prev) => [...prev, newPlaylist.id]);
        setCreateDialogOpen(false);
      } catch (err) {
        throw err; // CreatePlaylistDialogでエラーハンドリング
      }
    },
    [videoId]
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 300,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pr: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" component="div">
              保存先
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 0, py: 0 }}>
          {error && (
            <Box sx={{ px: 3, pb: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {/* 既存のプレイリスト一覧 */}
              {playlists.map((playlist) => {
                const isInPlaylist =
                  Array.isArray(playlistsWithVideo) &&
                  playlistsWithVideo.includes(playlist.id);
                const isUpdating = updatingPlaylist === playlist.id;

                return (
                  <ListItem key={playlist.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleTogglePlaylist(playlist)}
                      disabled={isUpdating}
                    >
                      <ListItemIcon>
                        {isUpdating ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Checkbox
                            checked={isInPlaylist}
                            tabIndex={-1}
                            disableRipple
                            size="small"
                          />
                        )}
                      </ListItemIcon>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <PlaylistIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={playlist.title}
                        secondary={`${playlist.video_count || 0}本の動画`}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}

              {playlists.length > 0 && <Divider />}

              {/* 新しいプレイリストを作成 */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => setCreateDialogOpen(true)}>
                  <ListItemIcon>
                    <AddIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="新しいプレイリストを作成"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>

              {playlists.length === 0 && !loading && (
                <Box sx={{ textAlign: "center", py: 4, px: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    プレイリストがありません
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </DialogContent>
      </Dialog>

      <CreatePlaylistDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreatePlaylist={handleCreatePlaylist}
      />
    </>
  );
}
