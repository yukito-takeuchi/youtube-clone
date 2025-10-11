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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
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
      setPlaylists(playlistsData);
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
      <Grid container spacing={3}>
        {/* Left Column - Profile Info */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
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

              <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                {profile?.channel_name || "チャンネル名未設定"}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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

              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
                アイコンをクリックしてマイチャンネルへ
              </Typography>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                クイックアクション
              </Typography>
              <List sx={{ py: 0 }}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => router.push("/videos/upload")}>
                    <ListItemIcon>
                      <VideoLibraryIcon />
                    </ListItemIcon>
                    <ListItemText primary="動画をアップロード" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => router.push("/videos/manage")}>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="動画を管理" />
                  </ListItemButton>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - History & Playlists */}
        <Grid item xs={12} md={8}>
          {/* History Section */}
          <Card sx={{ mb: 3 }}>
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
                    <Grid item xs={12} sm={6} md={4} key={playlist.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                        onClick={() => router.push(`/playlists/${playlist.id}`)}
                      >
                        <CardContent sx={{ py: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <PlaylistIcon
                              sx={{ mr: 1, color: "primary.main" }}
                            />
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              {playlist.title}
                            </Typography>
                          </Box>

                          <Typography variant="caption" color="text.secondary">
                            {playlist.video_count || 0}本の動画 •{" "}
                            {playlist.visibility === "public"
                              ? "公開"
                              : playlist.visibility === "unlisted"
                              ? "限定公開"
                              : "非公開"}
                          </Typography>

                          {playlist.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mt: 1,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {playlist.description}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
