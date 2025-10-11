"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Container,
  CircularProgress,
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  History as HistoryIcon,
  PlaylistPlay as PlaylistIcon,
  VideoLibrary as VideoLibraryIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { Playlist } from "@/types";

export default function MyPage() {
  const router = useRouter();
  const { isAuthenticated, user, profile, loading: authLoading } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        fetchPlaylists();
      }
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchPlaylists = async () => {
    try {
      const playlistsData = await api.getUserPlaylists();
      // 各プレイリストの最初の動画を取得してサムネイルを設定
      const playlistsWithThumbnails = await Promise.all(
        playlistsData.map(async (playlist) => {
          try {
            const videos = await api.getPlaylistVideos(playlist.id);
            return {
              ...playlist,
              thumbnail:
                videos.length > 0 ? videos[0].video?.thumbnail_url : null,
            };
          } catch (err) {
            return {
              ...playlist,
              thumbnail: null,
            };
          }
        })
      );
      setPlaylists(playlistsWithThumbnails);
    } catch (err) {
      console.error("Failed to fetch playlists:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelClick = () => {
    if (user) {
      router.push(`/profile/${user.id}`);
    }
  };

  if (authLoading || !user) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Profile Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Avatar
          src={profile?.icon_url}
          onClick={handleChannelClick}
          sx={{
            width: 120,
            height: 120,
            mx: "auto",
            mb: 2,
            cursor: "pointer",
            fontSize: "3rem",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          {profile?.channel_name?.[0]?.toUpperCase() ||
            user.email?.[0]?.toUpperCase() ||
            "U"}
        </Avatar>

        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          {profile?.channel_name || "チャンネル名未設定"}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {user.email}
        </Typography>

        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleChannelClick}
          sx={{ mb: 2 }}
        >
          チャンネルを管理
        </Button>

        <Typography variant="caption" display="block" color="text.secondary">
          アイコンをクリックしてマイチャンネルへ
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            クイックアクション
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<VideoLibraryIcon />}
              onClick={() => router.push("/videos/upload")}
            >
              動画をアップロード
            </Button>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => router.push("/videos/manage")}
            >
              動画を管理
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* History Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <HistoryIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              履歴
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ textAlign: "center", py: 4 }}>
            <HistoryIcon
              sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              履歴機能は準備中です
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 1 }}
            >
              視聴した動画がここに表示されます
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Playlists Section */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <PlaylistIcon sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                再生リスト
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {playlists.length}個のプレイリスト
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : playlists.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <PlaylistIcon
                sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                まだプレイリストがありません
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 1 }}
              >
                動画を保存してプレイリストを作成しましょう
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {playlists.map((playlist) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={playlist.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        boxShadow: 2,
                      },
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                    onClick={() => router.push(`/playlists/${playlist.id}`)}
                  >
                    {/* Thumbnail */}
                    <Box
                      sx={{
                        position: "relative",
                        paddingTop: "56.25%", // 16:9 aspect ratio
                        bgcolor: "grey.300",
                        backgroundImage: playlist.thumbnail
                          ? `url(${playlist.thumbnail})`
                          : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {!playlist.thumbnail && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            textAlign: "center",
                          }}
                        >
                          <PlaylistIcon
                            sx={{ fontSize: 40, color: "text.secondary" }}
                          />
                        </Box>
                      )}

                      {/* Video Count Badge */}
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          right: 8,
                          bgcolor: "rgba(0,0,0,0.8)",
                          color: "white",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                        }}
                      >
                        {playlist.video_count || 0}本
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          mb: 0.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {playlist.title}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {playlist.visibility === "public"
                          ? "公開"
                          : playlist.visibility === "unlisted"
                          ? "限定公開"
                          : "非公開"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
