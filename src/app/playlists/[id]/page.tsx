"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Shuffle as ShuffleIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  LinkOff as UnlistedIcon,
  DragIndicator as DragIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { api } from "@/lib/api";
import { Playlist, PlaylistVideo } from "@/types";

// Helper function to format relative date
function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) {
    return `${diffYears}年前`;
  } else if (diffMonths > 0) {
    return `${diffMonths}ヶ月前`;
  } else if (diffWeeks > 0) {
    return `${diffWeeks}週間前`;
  } else if (diffDays > 0) {
    return `${diffDays}日前`;
  } else if (diffHours > 0) {
    return `${diffHours}時間前`;
  } else if (diffMins > 0) {
    return `${diffMins}分前`;
  } else {
    return "数秒前";
  }
}

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [videos, setVideos] = useState<PlaylistVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVisibility, setEditVisibility] = useState<
    "public" | "unlisted" | "private"
  >("public");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const playlistId = Number(params.id);
  const isOwner = playlist && user && playlist.user_id === user.id;

  // プレイリストがデフォルトかどうかを判定する関数
  const isDefaultPlaylist = (title: string) => {
    return title === "あとで見る" || title === "高く評価した動画";
  };

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistData();
    }
  }, [playlistId]);

  const fetchPlaylistData = async () => {
    try {
      const [playlistData, videosData] = await Promise.all([
        api.getPlaylist(playlistId),
        api.getPlaylistVideos(playlistId),
      ]);
      setPlaylist(playlistData);
      setVideos(videosData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "プレイリストの読み込みに失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <PublicIcon fontSize="small" />;
      case "unlisted":
        return <UnlistedIcon fontSize="small" />;
      default:
        return <PrivateIcon fontSize="small" />;
    }
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "公開";
      case "unlisted":
        return "限定公開";
      default:
        return "非公開";
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEditClick = () => {
    if (playlist) {
      setEditTitle(playlist.title);
      setEditDescription(playlist.description || "");
      setEditVisibility(playlist.visibility);
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleEditSubmit = async () => {
    if (!playlist) return;

    setUpdating(true);
    try {
      await api.updatePlaylist(playlist.id, {
        title: editTitle,
        description: editDescription,
        visibility: editVisibility,
      });
      setEditDialogOpen(false);
      // Reload playlist data
      await fetchPlaylistData();
    } catch (err) {
      console.error("Failed to update playlist:", err);
      alert(
        err instanceof Error ? err.message : "プレイリストの更新に失敗しました"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!playlist) return;

    setUpdating(true);
    try {
      await api.deletePlaylist(playlist.id);
      router.push("/profile");
    } catch (err) {
      console.error("Failed to delete playlist:", err);
      alert(
        err instanceof Error ? err.message : "プレイリストの削除に失敗しました"
      );
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !playlist) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || "プレイリストが見つかりません"}
        </Alert>
      </Container>
    );
  }

  // 最初の動画のサムネイルをプレイリストのカバー画像として使用
  const coverImage = videos.length > 0 ? videos[0].video?.thumbnail_url : null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", gap: 4 }}>
        {/* Left Column - Playlist Info */}
        <Box sx={{ width: 400, flexShrink: 0 }}>
          <Card
            sx={{
              position: "sticky",
              top: 20,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: 2,
            }}
          >
            {/* Cover Image */}
            <Box
              sx={{
                position: "relative",
                paddingTop: "56.25%", // 16:9 aspect ratio
                bgcolor: "rgba(0,0,0,0.3)",
                borderRadius: "8px 8px 0 0",
                backgroundImage: coverImage ? `url(${coverImage})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {!coverImage && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h4" sx={{ opacity: 0.7, mb: 1 }}>
                    📺
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    動画がありません
                  </Typography>
                </Box>
              )}

              {/* Play Button Overlay */}
              {videos.length > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <IconButton
                    size="large"
                    sx={{
                      bgcolor: "rgba(0,0,0,0.7)",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(0,0,0,0.8)",
                      },
                    }}
                    onClick={() =>
                      videos[0]?.video &&
                      router.push(`/videos/${videos[0].video.id}`)
                    }
                  >
                    <PlayIcon sx={{ fontSize: 40 }} />
                  </IconButton>
                </Box>
              )}

              {/* Video Count Badge */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  bgcolor: "rgba(0,0,0,0.8)",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" sx={{ color: "white" }}>
                  {videos.length}本の動画
                </Typography>
              </Box>
            </Box>

            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600, flex: 1 }}>
                  {playlist.title}
                </Typography>
                {isOwner && !isDefaultPlaylist(playlist?.title || "") && (
                  <IconButton
                    size="small"
                    onClick={handleMenuOpen}
                    sx={{ color: "white", ml: 1 }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                )}
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                {getVisibilityIcon(playlist.visibility)}
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {getVisibilityText(playlist.visibility)}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                {new Date(playlist.updated_at).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                に更新
              </Typography>

              {playlist.description && (
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.9,
                    mb: 3,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {playlist.description}
                </Typography>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  startIcon={<PlayIcon />}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "grey.100",
                    },
                  }}
                  disabled={videos.length === 0}
                  onClick={() =>
                    videos[0]?.video &&
                    router.push(`/videos/${videos[0].video.id}`)
                  }
                >
                  再生
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ShuffleIcon />}
                  sx={{
                    borderColor: "white",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                  disabled={videos.length === 0}
                >
                  シャッフル
                </Button>
                <IconButton
                  sx={{
                    color: "white",
                    border: "1px solid white",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Column - Video List */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              動画 {videos.length}本
            </Typography>
            {isOwner && (
              <Typography variant="body2" color="text.secondary">
                動画をドラッグして順序を変更できます（準備中）
              </Typography>
            )}
          </Box>

          {videos.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                このプレイリストには動画がありません
              </Typography>
              <Typography variant="body2" color="text.secondary">
                動画を保存してプレイリストに追加しましょう
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {videos.map((playlistVideo, index) => {
                const video = playlistVideo.video;
                if (!video) return null;

                return (
                  <ListItem
                    key={playlistVideo.id}
                    sx={{
                      p: 0,
                      mb: 1,
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        width: "100%",
                        p: 1,
                        alignItems: "flex-start",
                        cursor: "pointer",
                      }}
                      onClick={() => router.push(`/videos/${video.id}`)}
                    >
                      {/* Drag Handle (for owners) */}
                      {isOwner && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mr: 1,
                            opacity: 0.5,
                          }}
                        >
                          <DragIcon fontSize="small" />
                        </Box>
                      )}

                      {/* Index */}
                      <Box
                        sx={{
                          width: 24,
                          textAlign: "center",
                          mr: 2,
                          mt: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {index + 1}
                        </Typography>
                      </Box>

                      {/* Thumbnail */}
                      <Box
                        sx={{
                          width: 120,
                          height: 68,
                          borderRadius: 1,
                          overflow: "hidden",
                          bgcolor: "grey.300",
                          mr: 2,
                          flexShrink: 0,
                          backgroundImage: video.thumbnail_url
                            ? `url(${video.thumbnail_url})`
                            : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {!video.thumbnail_url && (
                          <Typography variant="caption" color="text.secondary">
                            No Image
                          </Typography>
                        )}
                      </Box>

                      {/* Video Info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 500,
                            mb: 0.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {video.title}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {video.profile?.channel_name || "チャンネル名"} • {video.view_count.toLocaleString()}回視聴 • {getRelativeTime(video.created_at)}
                        </Typography>
                      </Box>

                      {/* Actions */}
                      <Box
                        sx={{ display: "flex", alignItems: "center", ml: 2 }}
                      >
                        {isOwner &&
                          !isDefaultPlaylist(playlist?.title || "") && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Remove from playlist functionality (準備中)
                              }}
                              sx={{ opacity: 0.7 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                      </Box>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </Box>

      {/* Owner Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon sx={{ mr: 1 }} />
          プレイリストを編集
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon sx={{ mr: 1 }} />
          プレイリストを削除
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => !updating && setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>プレイリストを編集</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="タイトル"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              fullWidth
              required
              disabled={updating}
            />
            <TextField
              label="説明"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              disabled={updating}
            />
            <FormControl fullWidth disabled={updating}>
              <InputLabel>公開設定</InputLabel>
              <Select
                value={editVisibility}
                label="公開設定"
                onChange={(e: SelectChangeEvent) =>
                  setEditVisibility(
                    e.target.value as "public" | "unlisted" | "private"
                  )
                }
              >
                <MenuItem value="public">公開</MenuItem>
                <MenuItem value="unlisted">限定公開</MenuItem>
                <MenuItem value="private">非公開</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={updating}>
            キャンセル
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={updating || !editTitle.trim()}
          >
            {updating ? "保存中..." : "保存"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !updating && setDeleteConfirmOpen(false)}
      >
        <DialogTitle>プレイリストを削除</DialogTitle>
        <DialogContent>
          <Typography>
            本当にこのプレイリストを削除しますか？この操作は取り消せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={updating}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={updating}
          >
            {updating ? "削除中..." : "削除"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
