"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Video } from "@/types";
import { api } from "@/lib/api";
import VideoPlayer from "@/components/VideoPlayer";
import { useAuth } from "@/contexts/AuthContext";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Button,
  Avatar,
  Divider,
  TextField,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Share as ShareIcon,
  PlaylistAdd as PlaylistAddIcon,
} from "@mui/icons-material";
import Link from "next/link";
import PlaylistDialog from "@/components/PlaylistDialog";

// Dummy related videos
const dummyRelatedVideos: Video[] = [
  {
    id: 101,
    title: "関連動画: Reactの最新機能を解説",
    description: "",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/related1/168/94",
    view_count: 8500,
    user_id: 10,
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-10T10:00:00Z",
    profile: {
      id: 10,
      user_id: 10,
      channel_name: "React Tips",
      icon_url: "https://picsum.photos/seed/channel1/36/36",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 102,
    title: "TypeScript完全ガイド2024",
    description: "",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/related2/168/94",
    view_count: 12000,
    user_id: 11,
    created_at: "2024-01-09T15:30:00Z",
    updated_at: "2024-01-09T15:30:00Z",
    profile: {
      id: 11,
      user_id: 11,
      channel_name: "TypeScript Pro",
      icon_url: "https://picsum.photos/seed/channel2/36/36",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 103,
    title: "Next.js App Routerの使い方",
    description: "",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/related3/168/94",
    view_count: 9200,
    user_id: 12,
    created_at: "2024-01-08T09:00:00Z",
    updated_at: "2024-01-08T09:00:00Z",
    profile: {
      id: 12,
      user_id: 12,
      channel_name: "Next.js Master",
      icon_url: "https://picsum.photos/seed/channel3/36/36",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 104,
    title: "Material UI v5の新機能",
    description: "",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/related4/168/94",
    view_count: 7800,
    user_id: 13,
    created_at: "2024-01-07T14:20:00Z",
    updated_at: "2024-01-07T14:20:00Z",
    profile: {
      id: 13,
      user_id: 13,
      channel_name: "UI Design",
      icon_url: "https://picsum.photos/seed/channel4/36/36",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 105,
    title: "Web開発のベストプラクティス",
    description: "",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/related5/168/94",
    view_count: 15000,
    user_id: 14,
    created_at: "2024-01-06T11:45:00Z",
    updated_at: "2024-01-06T11:45:00Z",
    profile: {
      id: 14,
      user_id: 14,
      channel_name: "Web Dev Pro",
      icon_url: "https://picsum.photos/seed/channel5/36/36",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 106,
    title: "JavaScriptのパフォーマンス最適化",
    description: "",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/related6/168/94",
    view_count: 10500,
    user_id: 15,
    created_at: "2024-01-05T16:00:00Z",
    updated_at: "2024-01-05T16:00:00Z",
    profile: {
      id: 15,
      user_id: 15,
      channel_name: "JS Performance",
      icon_url: "https://picsum.photos/seed/channel6/36/36",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 107,
    title: "REST API設計の基礎",
    description: "",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/related7/168/94",
    view_count: 11200,
    user_id: 16,
    created_at: "2024-01-04T13:30:00Z",
    updated_at: "2024-01-04T13:30:00Z",
    profile: {
      id: 16,
      user_id: 16,
      channel_name: "API Design",
      icon_url: "https://picsum.photos/seed/channel7/36/36",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 108,
    title: "Dockerで開発環境を構築",
    description: "",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/related8/168/94",
    view_count: 13500,
    user_id: 17,
    created_at: "2024-01-03T10:15:00Z",
    updated_at: "2024-01-03T10:15:00Z",
    profile: {
      id: 17,
      user_id: 17,
      channel_name: "DevOps Guide",
      icon_url: "https://picsum.photos/seed/channel8/36/36",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 109,
    title: "GitHubのワークフロー完全版",
    description: "",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/related9/168/94",
    view_count: 9700,
    user_id: 18,
    created_at: "2024-01-02T08:45:00Z",
    updated_at: "2024-01-02T08:45:00Z",
    profile: {
      id: 18,
      user_id: 18,
      channel_name: "Git Master",
      icon_url: "https://picsum.photos/seed/channel9/36/36",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 110,
    title: "CSSグリッドレイアウト入門",
    description: "",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/related10/168/94",
    view_count: 8800,
    user_id: 19,
    created_at: "2024-01-01T15:20:00Z",
    updated_at: "2024-01-01T15:20:00Z",
    profile: {
      id: 19,
      user_id: 19,
      channel_name: "CSS Expert",
      icon_url: "https://picsum.photos/seed/channel10/36/36",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 111,
    title: "Webアクセシビリティの基本",
    description: "",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/related11/168/94",
    view_count: 7500,
    user_id: 20,
    created_at: "2023-12-31T12:00:00Z",
    updated_at: "2023-12-31T12:00:00Z",
    profile: {
      id: 20,
      user_id: 20,
      channel_name: "A11y Guide",
      icon_url: "https://picsum.photos/seed/channel11/36/36",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 112,
    title: "モダンJavaScriptの書き方",
    description: "",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/related12/168/94",
    view_count: 14200,
    user_id: 21,
    created_at: "2023-12-30T09:30:00Z",
    updated_at: "2023-12-30T09:30:00Z",
    profile: {
      id: 21,
      user_id: 21,
      channel_name: "Modern JS",
      icon_url: "https://picsum.photos/seed/channel12/36/36",
      created_at: "",
      updated_at: "",
    },
  },
];

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const data = await api.getVideo(Number(params.id));
        setVideo(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "動画の読み込みに失敗しました"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchVideo();
    }
  }, [params.id]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography>読み込み中...</Typography>
      </Container>
    );
  }

  if (error || !video) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography color="error">{error || "動画が見つかりません"}</Typography>
      </Container>
    );
  }

  const isOwner = isAuthenticated && user && video.user_id === user.id;

  const handleSaveClick = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setPlaylistDialogOpen(true);
  };

  return (
    <Container maxWidth={false} sx={{ px: 0, maxWidth: 2400, mx: "auto", py: 2 }}>
      <Box sx={{ display: "flex", gap: 3, px: 2 }}>
        {/* Main Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Video Player */}
          <VideoPlayer videoUrl={video.video_url} title={video.title} />

          {/* Video Title */}
          <Typography variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
            {video.title}
          </Typography>

          {/* Actions Bar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {video.view_count.toLocaleString()} 回視聴 •{" "}
              {new Date(video.created_at).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              {/* Like/Dislike */}
              <Box
                sx={{
                  display: "flex",
                  bgcolor: "action.hover",
                  borderRadius: 50,
                  overflow: "hidden",
                }}
              >
                <IconButton size="small" sx={{ borderRadius: 0 }}>
                  <ThumbUpIcon fontSize="small" />
                  <Typography variant="body2" sx={{ ml: 1, mr: 1 }}>
                    0
                  </Typography>
                </IconButton>
                <Divider orientation="vertical" flexItem />
                <IconButton size="small" sx={{ borderRadius: 0 }}>
                  <ThumbDownIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Share */}
              <IconButton sx={{ bgcolor: "action.hover", borderRadius: 50 }}>
                <ShareIcon fontSize="small" />
                <Typography variant="body2" sx={{ ml: 1, mr: 1 }}>
                  共有
                </Typography>
              </IconButton>

              {/* Save to Playlist */}
              <IconButton
                onClick={handleSaveClick}
                sx={{ bgcolor: "action.hover", borderRadius: 50 }}
              >
                <PlaylistAddIcon fontSize="small" />
                <Typography variant="body2" sx={{ ml: 1, mr: 1 }}>
                  保存
                </Typography>
              </IconButton>
            </Box>
          </Box>

          <Divider />

          {/* Channel Info */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 2,
            }}
          >
            <Link
              href={`/profile/${video.user_id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Avatar
                src={video.profile?.icon_url}
                sx={{
                  width: 40,
                  height: 40,
                  cursor: "pointer",
                  "&:hover": { opacity: 0.8 },
                }}
              >
                {video.profile?.channel_name?.[0]?.toUpperCase() || "U"}
              </Avatar>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    cursor: "pointer",
                    "&:hover": { opacity: 0.8 },
                  }}
                >
                  {video.profile?.channel_name || "チャンネル名"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  登録者数 0人
                </Typography>
              </Box>
            </Link>

            {!isOwner && (
              <Button
                variant="contained"
                sx={{
                  bgcolor: "text.primary",
                  color: "background.paper",
                  borderRadius: 50,
                  px: 3,
                  "&:hover": { bgcolor: "text.secondary" },
                }}
              >
                登録
              </Button>
            )}
          </Box>

          <Divider />

          {/* Description */}
          <Box sx={{ bgcolor: "action.hover", borderRadius: 2, p: 2, mt: 2 }}>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {video.description || "説明はありません"}
            </Typography>
          </Box>

          {/* Comments Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              コメント • 0
            </Typography>

            {/* Comment Input */}
            {isAuthenticated && (
              <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 40, height: 40 }}>
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </Avatar>
                <TextField
                  fullWidth
                  placeholder="コメントを追加..."
                  variant="standard"
                  disabled
                />
              </Box>
            )}

            {/* Comments List */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              コメント機能は未実装です
            </Typography>
          </Box>
        </Box>

        {/* Sidebar - Related Videos */}
        <Box sx={{ width: 420, display: { xs: "none", lg: "block" } }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {dummyRelatedVideos.map((relatedVideo) => (
              <Card
                key={relatedVideo.id}
                elevation={0}
                sx={{
                  display: "flex",
                  cursor: "pointer",
                  bgcolor: "transparent",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
                onClick={() => router.push(`/videos/${relatedVideo.id}`)}
              >
                <CardMedia
                  component="img"
                  image={relatedVideo.thumbnail_url}
                  alt={relatedVideo.title}
                  sx={{
                    width: 168,
                    height: 94,
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
                <CardContent sx={{ flex: 1, p: "0 !important", pl: 1.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mb: 0.5,
                    }}
                  >
                    {relatedVideo.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.3 }}
                  >
                    {relatedVideo.profile?.channel_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {relatedVideo.view_count.toLocaleString()}回視聴
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Playlist Dialog */}
      {video && (
        <PlaylistDialog
          open={playlistDialogOpen}
          onClose={() => setPlaylistDialogOpen(false)}
          videoId={video.id}
          videoTitle={video.title}
        />
      )}
    </Container>
  );
}
