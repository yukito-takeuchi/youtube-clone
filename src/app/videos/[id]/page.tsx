'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Video } from '@/types';
import { api } from '@/lib/api';
import VideoPlayer from '@/components/VideoPlayer';
import { useAuth } from '@/contexts/AuthContext';

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const data = await api.getVideo(Number(params.id));
        setVideo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '動画の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchVideo();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!video || !confirm('この動画を削除しますか？')) return;

    try {
      await api.deleteVideo(video.id);
      router.push('/');
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || '動画が見つかりません'}
        </div>
      </div>
    );
  }

  const isOwner = isAuthenticated && user && video.user_id === user.id;

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Video Player */}
          <VideoPlayer videoUrl={video.video_url} title={video.title} />

          {/* Video Info */}
          <div className="mt-3">
            <h1 className="text-xl font-semibold mb-2">{video.title}</h1>

            <div className="flex items-center justify-between">
              {/* Channel Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-semibold">
                  U
                </div>
                <div>
                  <p className="font-semibold text-sm">チャンネル名</p>
                  <p className="text-xs text-gray-600">
                    {video.view_count.toLocaleString()} 回視聴 • {new Date(video.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {isOwner && (
                  <>
                    <button
                      onClick={() => router.push(`/videos/${video.id}/edit`)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      編集
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      削除
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 bg-gray-100 rounded-xl p-3">
              <p className="text-sm whitespace-pre-wrap">{video.description || '説明はありません'}</p>
            </div>
          </div>
        </div>

        {/* Sidebar - Related videos placeholder */}
        <div className="hidden lg:block">
          <div className="text-sm text-gray-500">
            関連動画（未実装）
          </div>
        </div>
      </div>
    </div>
  );
}
