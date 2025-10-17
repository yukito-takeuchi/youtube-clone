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
import { WatchHistory } from "@/types";
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
import { getIconUrl } from "@/lib/defaults";

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
      description: "",
      banner_url: "",
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
      description: "",
      banner_url: "",
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
      description: "",
      banner_url: "",
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
      description: "",
      banner_url: "",
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
      description: "",
      banner_url: "",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 6,
    title: "Webアクセシビリティの実践：誰もが使いやすいWebを",
    description: "WCAG準拠のアクセシブルなWebサイトの作り方",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video6/320/180",
    view_count: 9800,
    user_id: 6,
    created_at: "2024-01-10T14:00:00Z",
    updated_at: "2024-01-10T14:00:00Z",
    profile: {
      id: 6,
      user_id: 6,
      channel_name: "Accessibility Expert",
      icon_url: "https://picsum.photos/seed/user6/100/100",
      description: "",
      banner_url: "",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 7,
    title: "SQLパフォーマンスチューニング入門",
    description: "クエリ最適化とインデックス設計の基礎",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video7/320/180",
    view_count: 11200,
    user_id: 7,
    created_at: "2024-01-09T10:30:00Z",
    updated_at: "2024-01-09T10:30:00Z",
    profile: {
      id: 7,
      user_id: 7,
      channel_name: "Database Pro",
      icon_url: "https://picsum.photos/seed/user7/100/100",
      description: "",
      banner_url: "",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 8,
    title: "モダンCSS：GridとFlexboxを使いこなす",
    description: "CSS GridとFlexboxによる柔軟なレイアウト設計",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video8/320/180",
    view_count: 8700,
    user_id: 8,
    created_at: "2024-01-08T16:15:00Z",
    updated_at: "2024-01-08T16:15:00Z",
    profile: {
      id: 8,
      user_id: 8,
      channel_name: "CSS Master",
      icon_url: "https://picsum.photos/seed/user8/100/100",
      description: "",
      banner_url: "",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 9,
    title: "Git/GitHub実践ワークフロー",
    description: "チーム開発で使えるGitの実践テクニック",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video9/320/180",
    view_count: 13900,
    user_id: 9,
    created_at: "2024-01-07T11:00:00Z",
    updated_at: "2024-01-07T11:00:00Z",
    profile: {
      id: 9,
      user_id: 9,
      channel_name: "Git Guru",
      icon_url: "https://picsum.photos/seed/user9/100/100",
      description: "",
      banner_url: "",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 10,
    title: "Vue.js 3 Composition API完全ガイド",
    description: "Vue 3の新機能Composition APIを徹底解説",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video10/320/180",
    view_count: 10500,
    user_id: 10,
    created_at: "2024-01-06T13:30:00Z",
    updated_at: "2024-01-06T13:30:00Z",
    profile: {
      id: 10,
      user_id: 10,
      channel_name: "Vue Master",
      icon_url: "https://picsum.photos/seed/user10/100/100",
      description: "",
      banner_url: "",
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
      description: "",
      banner_url: "",
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
      description: "",
      banner_url: "",
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
      description: "",
      banner_url: "",
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
      description: "",
      banner_url: "",
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
      description: "",
      banner_url: "",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 16,
    title: "Redis入門：高速キャッシュの活用法",
    description: "Redisを使ったキャッシング戦略とパフォーマンス改善",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video16/320/180",
    view_count: 14800,
    user_id: 16,
    created_at: "2024-01-05T12:00:00Z",
    updated_at: "2024-01-05T12:00:00Z",
    profile: {
      id: 16,
      user_id: 16,
      channel_name: "Cache Master",
      icon_url: "https://picsum.photos/seed/user16/100/100",
      description: "",
      banner_url: "",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 17,
    title: "WebSocketで実現するリアルタイム通信",
    description: "WebSocketの基礎から実装まで徹底解説",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video17/320/180",
    view_count: 12300,
    user_id: 17,
    created_at: "2024-01-04T15:45:00Z",
    updated_at: "2024-01-04T15:45:00Z",
    profile: {
      id: 17,
      user_id: 17,
      channel_name: "Realtime Dev",
      icon_url: "https://picsum.photos/seed/user17/100/100",
      description: "",
      banner_url: "",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 18,
    title: "Firebaseで作るサーバーレスアプリ",
    description: "Firebase Authentication、Firestore、Hostingの活用",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video18/320/180",
    view_count: 19700,
    user_id: 18,
    created_at: "2024-01-03T10:20:00Z",
    updated_at: "2024-01-03T10:20:00Z",
    profile: {
      id: 18,
      user_id: 18,
      channel_name: "Firebase Expert",
      icon_url: "https://picsum.photos/seed/user18/100/100",
      description: "",
      banner_url: "",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 19,
    title: "Tailwind CSSで爆速UI開発",
    description: "Utility-FirstなCSSフレームワークの使い方",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video19/320/180",
    view_count: 16200,
    user_id: 19,
    created_at: "2024-01-02T14:00:00Z",
    updated_at: "2024-01-02T14:00:00Z",
    profile: {
      id: 19,
      user_id: 19,
      channel_name: "Tailwind Pro",
      icon_url: "https://picsum.photos/seed/user19/100/100",
      description: "",
      banner_url: "",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 20,
    title: "Node.js ストリーム処理の極意",
    description: "大容量データを効率的に処理するストリーム活用法",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video20/320/180",
    view_count: 11900,
    user_id: 20,
    created_at: "2024-01-01T16:30:00Z",
    updated_at: "2024-01-01T16:30:00Z",
    profile: {
      id: 20,
      user_id: 20,
      channel_name: "Node.js Master",
      icon_url: "https://picsum.photos/seed/user20/100/100",
      description: "",
      banner_url: "",
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
      description: "",
      banner_url: "",
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
      description: "",
      banner_url: "",
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
      description: "",
      banner_url: "",
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
      description: "",
      banner_url: "",
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
      description: "",
      banner_url: "",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 26,
    title: "Vim/Neovimカスタマイズ術",
    description: "エディタを自分好みにカスタマイズする方法",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video26/320/180",
    view_count: 8900,
    user_id: 26,
    created_at: "2023-12-31T14:00:00Z",
    updated_at: "2023-12-31T14:00:00Z",
    profile: {
      id: 26,
      user_id: 26,
      channel_name: "Editor Master",
      icon_url: "https://picsum.photos/seed/user26/100/100",
      description: "",
      banner_url: "",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 27,
    title: "Linux サーバー構築入門",
    description: "Ubuntu/CentOSでのサーバーセットアップ",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video27/320/180",
    view_count: 17600,
    user_id: 27,
    created_at: "2023-12-30T11:30:00Z",
    updated_at: "2023-12-30T11:30:00Z",
    profile: {
      id: 27,
      user_id: 27,
      channel_name: "Linux Admin",
      icon_url: "https://picsum.photos/seed/user27/100/100",
      description: "",
      banner_url: "",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 28,
    title: "Rustで学ぶシステムプログラミング",
    description: "安全で高速なRustプログラミングの基礎",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video28/320/180",
    view_count: 13400,
    user_id: 28,
    created_at: "2023-12-29T15:45:00Z",
    updated_at: "2023-12-29T15:45:00Z",
    profile: {
      id: 28,
      user_id: 28,
      channel_name: "Rust Developer",
      icon_url: "https://picsum.photos/seed/user28/100/100",
      description: "",
      banner_url: "",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 29,
    title: "Swift UI実践：iOSアプリ開発",
    description: "SwiftUIを使ったモダンなiOSアプリ開発",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video29/320/180",
    view_count: 20100,
    user_id: 29,
    created_at: "2023-12-28T10:00:00Z",
    updated_at: "2023-12-28T10:00:00Z",
    profile: {
      id: 29,
      user_id: 29,
      channel_name: "iOS Pro",
      icon_url: "https://picsum.photos/seed/user29/100/100",
      description: "",
      banner_url: "",
      created_at: "",
      updated_at: "",
    },
  },
  {
    id: 30,
    title: "Python データ分析入門：PandasとMatplotlib",
    description: "データ分析・可視化の基礎から応用まで",
    video_url: "",
    thumbnail_url: "https://picsum.photos/seed/video30/320/180",
    view_count: 22800,
    user_id: 30,
    created_at: "2023-12-27T13:20:00Z",
    updated_at: "2023-12-27T13:20:00Z",
    profile: {
      id: 30,
      user_id: 30,
      channel_name: "Data Science Lab",
      icon_url: "https://picsum.photos/seed/user30/100/100",
      description: "",
      banner_url: "",
      created_at: "",
      updated_at: "",
    },
  },
];

export default function MyPage() {
  const router = useRouter();
  const { isAuthenticated, user, profile, loading: authLoading } = useAuth();
  const [playlists, setPlaylists] = useState<(Playlist & { thumbnail?: string | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
        fetchWatchHistory();
      }
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch watch history when page changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchWatchHistory();
    }
  }, [historyPage]);

  const fetchPlaylists = async () => {
    const startTime = Date.now();

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

      // Ensure minimum loading time for better UX
      const elapsedTime = Date.now() - startTime;
      const MIN_LOADING_TIME = 500;
      if (elapsedTime < MIN_LOADING_TIME) {
        await new Promise((resolve) =>
          setTimeout(resolve, MIN_LOADING_TIME - elapsedTime)
        );
      }

      setPlaylists(playlistsWithThumbnails);
    } catch (err) {
      console.error("Failed to fetch playlists:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchHistory = async () => {
    setHistoryLoading(true);
    const startTime = Date.now();

    try {
      const offset = (historyPage - 1) * ITEMS_PER_PAGE;
      const history = await api.getWatchHistory(ITEMS_PER_PAGE, offset);

      // Ensure minimum loading time for better UX
      const elapsedTime = Date.now() - startTime;
      const MIN_LOADING_TIME = 500;
      if (elapsedTime < MIN_LOADING_TIME) {
        await new Promise((resolve) =>
          setTimeout(resolve, MIN_LOADING_TIME - elapsedTime)
        );
      }

      setWatchHistory(history || []);
    } catch (err) {
      console.error("Failed to fetch watch history:", err);
      setWatchHistory([]);
    } finally {
      setHistoryLoading(false);
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
          src={getIconUrl(profile?.icon_url)}
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                disabled={watchHistory.length < ITEMS_PER_PAGE}
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
        </Box>

        {historyLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : watchHistory.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              bgcolor: "grey.50",
              borderRadius: 2,
            }}
          >
            <HistoryIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              まだ履歴がありません
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
            }}
          >
            {watchHistory.map((history) => history.video && (
              <Card
                key={history.id}
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
                onClick={() => router.push(`/videos/${history.video?.id}`)}
              >
                <CardMedia
                  className="thumbnail"
                  component="img"
                  image={history.video.thumbnail_url}
                  alt={history.video.title}
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
                    {history.video.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    {history.video.profile?.channel_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {history.video.view_count.toLocaleString()}回視聴
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
          </Box>
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
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <PlaylistIcon sx={{ fontSize: 14 }} />
                        {playlist.video_count || 0}本の動画
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
      </Box>
    </Container>
  );
}
