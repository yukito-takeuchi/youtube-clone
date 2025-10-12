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
  Button,
  CardMedia,
  Link as MuiLink,
} from "@mui/material";
import {
  VideoLibrary as VideoLibraryIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  PlaylistPlay as PlaylistIcon,
  ChevronRight as ChevronRightIcon,
  WatchLater as WatchLaterIcon,
  ThumbUp as ThumbUpIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { api } from "@/lib/api";
import { Playlist, Video } from "@/types";

// Dummy history data
const dummyHistoryVideos: Video[] = [
  {
    id: 1,
    title: "TypeScriptの基本から応用まで完全ガイド",
    description: "TypeScriptの基本的な使い方から応用テクニックまでを解説",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video1/320/180",
    view_count: 12500,
    user_id: 1,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    profile: {
      id: 1,
      user_id: 1,
      channel_name: "Tech Channel",
      icon_url: "https://picsum.photos/seed/user1/100/100",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 2,
    title: "Next.js 14の新機能を徹底解説",
    description: "Next.js 14の新機能とApp Routerについて",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video2/320/180",
    view_count: 8900,
    user_id: 2,
    created_at: "2024-01-14T15:30:00Z",
    updated_at: "2024-01-14T15:30:00Z",
    profile: {
      id: 2,
      user_id: 2,
      channel_name: "Web Dev Master",
      icon_url: "https://picsum.photos/seed/user2/100/100",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 3,
    title: "Material UIでモダンなUIを作る方法",
    description: "Material UI v5を使った実践的なUI開発",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video3/320/180",
    view_count: 5600,
    user_id: 3,
    created_at: "2024-01-13T09:00:00Z",
    updated_at: "2024-01-13T09:00:00Z",
    profile: {
      id: 3,
      user_id: 3,
      channel_name: "UI Design Pro",
      icon_url: "https://picsum.photos/seed/user3/100/100",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 4,
    title: "ReactのuseEffectを完全に理解する",
    description: "useEffectの使い方と注意点を詳しく解説",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video4/320/180",
    view_count: 15200,
    user_id: 4,
    created_at: "2024-01-12T14:20:00Z",
    updated_at: "2024-01-12T14:20:00Z",
    profile: {
      id: 4,
      user_id: 4,
      channel_name: "React Academy",
      icon_url: "https://picsum.photos/seed/user4/100/100",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 5,
    title: "Goで作る高速なバックエンドAPI",
    description: "Go言語とGinフレームワークでREST APIを構築",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video5/320/180",
    view_count: 7300,
    user_id: 5,
    created_at: "2024-01-11T11:45:00Z",
    updated_at: "2024-01-11T11:45:00Z",
    profile: {
      id: 5,
      user_id: 5,
      channel_name: "Go Programming",
      icon_url: "https://picsum.photos/seed/user5/100/100",
      created_at: "",
      updated_at: "",
    },
  },
];

// Dummy watch later videos
const dummyWatchLaterVideos: Video[] = [
  {
    id: 11,
    title: "Docker完全ガイド：コンテナ技術の基礎から実践まで",
    description: "Dockerの基本からデプロイまで網羅",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video11/320/180",
    view_count: 18500,
    user_id: 11,
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-10T08:00:00Z",
    profile: {
      id: 11,
      user_id: 11,
      channel_name: "DevOps Academy",
      icon_url: "https://picsum.photos/seed/user11/100/100",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 12,
    title: "AWS入門：クラウドサービスの基本を理解する",
    description: "AWSの主要サービスをわかりやすく解説",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video12/320/180",
    view_count: 22100,
    user_id: 12,
    created_at: "2024-01-09T16:30:00Z",
    updated_at: "2024-01-09T16:30:00Z",
    profile: {
      id: 12,
      user_id: 12,
      channel_name: "Cloud Engineer",
      icon_url: "https://picsum.photos/seed/user12/100/100",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 13,
    title: "GraphQL vs REST API：どちらを選ぶべきか",
    description: "GraphQLとRESTの違いと使い分け",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video13/320/180",
    view_count: 9800,
    user_id: 13,
    created_at: "2024-01-08T11:15:00Z",
    updated_at: "2024-01-08T11:15:00Z",
    profile: {
      id: 13,
      user_id: 13,
      channel_name: "API Design Pro",
      icon_url: "https://picsum.photos/seed/user13/100/100",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 14,
    title: "セキュリティ対策：Webアプリの脆弱性を防ぐ",
    description: "XSS、CSRF、SQLインジェクションなど主要な脆弱性対策",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video14/320/180",
    view_count: 13400,
    user_id: 14,
    created_at: "2024-01-07T13:45:00Z",
    updated_at: "2024-01-07T13:45:00Z",
    profile: {
      id: 14,
      user_id: 14,
      channel_name: "Security Expert",
      icon_url: "https://picsum.photos/seed/user14/100/100",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 15,
    title: "パフォーマンス最適化：高速なWebアプリを作る",
    description: "フロントエンド・バックエンド両面からの最適化テクニック",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video15/320/180",
    view_count: 16700,
    user_id: 15,
    created_at: "2024-01-06T09:20:00Z",
    updated_at: "2024-01-06T09:20:00Z",
    profile: {
      id: 15,
      user_id: 15,
      channel_name: "Performance Pro",
      icon_url: "https://picsum.photos/seed/user15/100/100",
      created_at: "",
      updated_at: "",
    },
  },
];

// Dummy liked videos
const dummyLikedVideos: Video[] = [
  {
    id: 21,
    title: "Kubernetes基礎：コンテナオーケストレーション入門",
    description: "Kubernetesの基本概念とデプロイ方法",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video21/320/180",
    view_count: 25300,
    user_id: 21,
    created_at: "2024-01-05T10:00:00Z",
    updated_at: "2024-01-05T10:00:00Z",
    profile: {
      id: 21,
      user_id: 21,
      channel_name: "K8s Master",
      icon_url: "https://picsum.photos/seed/user21/100/100",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 22,
    title: "CI/CD パイプライン構築：自動化で開発効率UP",
    description: "GitHub ActionsとCircleCIを使った実践的なCI/CD",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video22/320/180",
    view_count: 19200,
    user_id: 22,
    created_at: "2024-01-04T14:30:00Z",
    updated_at: "2024-01-04T14:30:00Z",
    profile: {
      id: 22,
      user_id: 22,
      channel_name: "DevOps Pro",
      icon_url: "https://picsum.photos/seed/user22/100/100",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 23,
    title: "マイクロサービスアーキテクチャ設計の実践",
    description: "モノリスからマイクロサービスへの移行戦略",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video23/320/180",
    view_count: 21800,
    user_id: 23,
    created_at: "2024-01-03T11:00:00Z",
    updated_at: "2024-01-03T11:00:00Z",
    profile: {
      id: 23,
      user_id: 23,
      channel_name: "Architecture Guide",
      icon_url: "https://picsum.photos/seed/user23/100/100",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 24,
    title: "データベース設計のベストプラクティス",
    description: "正規化、インデックス、パフォーマンスチューニング",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video24/320/180",
    view_count: 17500,
    user_id: 24,
    created_at: "2024-01-02T15:20:00Z",
    updated_at: "2024-01-02T15:20:00Z",
    profile: {
      id: 24,
      user_id: 24,
      channel_name: "DB Expert",
      icon_url: "https://picsum.photos/seed/user24/100/100",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 25,
    title: "テスト駆動開発（TDD）で品質向上",
    description: "ユニットテスト、統合テスト、E2Eテストの実践",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video25/320/180",
    view_count: 14300,
    user_id: 25,
    created_at: "2024-01-01T09:00:00Z",
    updated_at: "2024-01-01T09:00:00Z",
    profile: {
      id: 25,
      user_id: 25,
      channel_name: "Test Master",
      icon_url: "https://picsum.photos/seed/user25/100/100",
      created_at: "",
      updated_at: "",
    },
  },
];

export default function MyPage() {
  const router = useRouter();
  const { isAuthenticated, user, profile, loading: authLoading } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [historyPage, setHistoryPage] = useState(1);
  const [playlistsPage, setPlaylistsPage] = useState(1);
  const [watchLaterPage, setWatchLaterPage] = useState(1);
  const [likedPage, setLikedPage] = useState(1);

  const ITEMS_PER_PAGE = 5;

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
    <Container maxWidth={false} sx={{ px: 2, maxWidth: 1800, mx: "auto", py: 3 }}>
      {/* Compact Profile Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Avatar
          src={profile?.icon_url}
          onClick={handleChannelClick}
          sx={{
            width: 56,
            height: 56,
            cursor: "pointer",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          {profile?.channel_name?.[0]?.toUpperCase() ||
            user.email?.[0]?.toUpperCase() ||
            "U"}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {profile?.channel_name || "チャンネル名未設定"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<VideoLibraryIcon />}
            onClick={() => router.push("/videos/manage")}
          >
            動画を管理
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={handleChannelClick}
          >
            チャンネル
          </Button>
        </Box>
      </Box>

      {/* History Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HistoryIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              履歴
            </Typography>
          </Box>
          <MuiLink
            component={Link}
            href="#"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "primary.main",
              fontSize: "0.875rem",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            すべて表示
            <ChevronRightIcon sx={{ fontSize: 20 }} />
          </MuiLink>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
          }}
        >
          {dummyHistoryVideos
            .slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE)
            .map((video) => (
              <Card
                key={video.id}
                elevation={0}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "calc((100% - 16px) / 2)",
                    md: "calc((100% - 32px) / 3)",
                    lg: "calc((100% - 64px) / 5)",
                  },
                  flex: "0 0 auto",
                  bgcolor: "transparent",
                  cursor: "pointer",
                  "&:hover": {
                    "& .thumbnail": {
                      transform: "scale(1.02)",
                    },
                  },
                }}
                onClick={() => router.push(`/videos/${video.id}`)}
              >
                <CardMedia
                  className="thumbnail"
                  component="img"
                  image={video.thumbnail_url}
                  alt={video.title}
                  sx={{
                    borderRadius: 2,
                    aspectRatio: "16/9",
                    transition: "transform 0.2s",
                  }}
                />
                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.4,
                      minHeight: "2.8em",
                    }}
                  >
                    {video.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    {video.profile?.channel_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {video.view_count.toLocaleString()}回視聴
                  </Typography>
                </CardContent>
              </Card>
            ))}
        </Box>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setHistoryPage(historyPage - 1)}
            disabled={historyPage === 1}
            sx={{
              minWidth: "auto",
              p: 0.5,
              "&:disabled": {
                opacity: 0.3,
              },
            }}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setHistoryPage(historyPage + 1)}
            disabled={historyPage === Math.ceil(dummyHistoryVideos.length / ITEMS_PER_PAGE)}
            sx={{
              minWidth: "auto",
              p: 0.5,
              "&:disabled": {
                opacity: 0.3,
              },
            }}
          >
            <ChevronRightIcon />
          </Button>
        </Box>
      </Box>

      {/* Playlists Section */}
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PlaylistIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              再生リスト
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ({playlists.length})
            </Typography>
          </Box>
          <MuiLink
            component={Link}
            href="#"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "primary.main",
              fontSize: "0.875rem",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            すべて表示
            <ChevronRightIcon sx={{ fontSize: 20 }} />
          </MuiLink>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : playlists.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              bgcolor: "grey.50",
              borderRadius: 2,
            }}
          >
            <PlaylistIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              まだプレイリストがありません
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
              }}
            >
              {playlists
                .slice((playlistsPage - 1) * ITEMS_PER_PAGE, playlistsPage * ITEMS_PER_PAGE)
                .map((playlist) => (
                  <Card
                    key={playlist.id}
                    variant="outlined"
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "calc((100% - 16px) / 2)",
                        md: "calc((100% - 32px) / 3)",
                        lg: "calc((100% - 64px) / 5)",
                      },
                      flex: "0 0 auto",
                      cursor: "pointer",
                      "&:hover": {
                        boxShadow: 2,
                      },
                      borderRadius: 2,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onClick={() => router.push(`/playlists/${playlist.id}`)}
                  >
                    {/* Thumbnail */}
                    <Box
                      sx={{
                        position: "relative",
                        paddingTop: "56.25%",
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
                          <PlaylistIcon sx={{ fontSize: 40, color: "text.secondary" }} />
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

                    <CardContent sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          mb: 0.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.4,
                          minHeight: "2.8em",
                          flex: 1,
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
                ))}
            </Box>

            {/* Pagination */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setPlaylistsPage(playlistsPage - 1)}
                disabled={playlistsPage === 1}
                sx={{
                  minWidth: "auto",
                  p: 0.5,
                  "&:disabled": {
                    opacity: 0.3,
                  },
                }}
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setPlaylistsPage(playlistsPage + 1)}
                disabled={playlistsPage === Math.ceil(playlists.length / ITEMS_PER_PAGE)}
                sx={{
                  minWidth: "auto",
                  p: 0.5,
                  "&:disabled": {
                    opacity: 0.3,
                  },
                }}
              >
                <ChevronRightIcon />
              </Button>
            </Box>
          </>
        )}
      </Box>

      {/* Watch Later Section */}
      <Box sx={{ mb: 4, mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WatchLaterIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              あとで見る
            </Typography>
          </Box>
          <MuiLink
            component={Link}
            href="#"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "primary.main",
              fontSize: "0.875rem",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            すべて表示
            <ChevronRightIcon sx={{ fontSize: 20 }} />
          </MuiLink>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
          }}
        >
          {dummyWatchLaterVideos
            .slice((watchLaterPage - 1) * ITEMS_PER_PAGE, watchLaterPage * ITEMS_PER_PAGE)
            .map((video) => (
              <Card
                key={video.id}
                elevation={0}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "calc((100% - 16px) / 2)",
                    md: "calc((100% - 32px) / 3)",
                    lg: "calc((100% - 64px) / 5)",
                  },
                  flex: "0 0 auto",
                  bgcolor: "transparent",
                  cursor: "pointer",
                  "&:hover": {
                    "& .thumbnail": {
                      transform: "scale(1.02)",
                    },
                  },
                }}
                onClick={() => router.push(`/videos/${video.id}`)}
              >
                <CardMedia
                  className="thumbnail"
                  component="img"
                  image={video.thumbnail_url}
                  alt={video.title}
                  sx={{
                    borderRadius: 2,
                    aspectRatio: "16/9",
                    transition: "transform 0.2s",
                  }}
                />
                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.4,
                      minHeight: "2.8em",
                    }}
                  >
                    {video.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    {video.profile?.channel_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {video.view_count.toLocaleString()}回視聴
                  </Typography>
                </CardContent>
              </Card>
            ))}
        </Box>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setWatchLaterPage(watchLaterPage - 1)}
            disabled={watchLaterPage === 1}
            sx={{
              minWidth: "auto",
              p: 0.5,
              "&:disabled": {
                opacity: 0.3,
              },
            }}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setWatchLaterPage(watchLaterPage + 1)}
            disabled={watchLaterPage === Math.ceil(dummyWatchLaterVideos.length / ITEMS_PER_PAGE)}
            sx={{
              minWidth: "auto",
              p: 0.5,
              "&:disabled": {
                opacity: 0.3,
              },
            }}
          >
            <ChevronRightIcon />
          </Button>
        </Box>
      </Box>

      {/* Liked Videos Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ThumbUpIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              高く評価した動画
            </Typography>
          </Box>
          <MuiLink
            component={Link}
            href="#"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "primary.main",
              fontSize: "0.875rem",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            すべて表示
            <ChevronRightIcon sx={{ fontSize: 20 }} />
          </MuiLink>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
          }}
        >
          {dummyLikedVideos
            .slice((likedPage - 1) * ITEMS_PER_PAGE, likedPage * ITEMS_PER_PAGE)
            .map((video) => (
              <Card
                key={video.id}
                elevation={0}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "calc((100% - 16px) / 2)",
                    md: "calc((100% - 32px) / 3)",
                    lg: "calc((100% - 64px) / 5)",
                  },
                  flex: "0 0 auto",
                  bgcolor: "transparent",
                  cursor: "pointer",
                  "&:hover": {
                    "& .thumbnail": {
                      transform: "scale(1.02)",
                    },
                  },
                }}
                onClick={() => router.push(`/videos/${video.id}`)}
              >
              <CardMedia
                className="thumbnail"
                component="img"
                image={video.thumbnail_url}
                alt={video.title}
                sx={{
                  borderRadius: 2,
                  aspectRatio: "16/9",
                  transition: "transform 0.2s",
                }}
              />
              <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.4,
                    minHeight: "2.8em",
                  }}
                >
                  {video.title}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 0.5 }}
                >
                  {video.profile?.channel_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {video.view_count.toLocaleString()}回視聴
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setLikedPage(likedPage - 1)}
            disabled={likedPage === 1}
            sx={{
              minWidth: "auto",
              p: 0.5,
              "&:disabled": {
                opacity: 0.3,
              },
            }}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setLikedPage(likedPage + 1)}
            disabled={likedPage === Math.ceil(dummyLikedVideos.length / ITEMS_PER_PAGE)}
            sx={{
              minWidth: "auto",
              p: 0.5,
              "&:disabled": {
                opacity: 0.3,
              },
            }}
          >
            <ChevronRightIcon />
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
