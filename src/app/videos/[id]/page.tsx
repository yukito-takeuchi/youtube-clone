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
  const { isAuthenticated } = useAuth();
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || '動画が見つかりません'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Video Player */}
      <VideoPlayer videoUrl={video.video_url} title={video.title} />

      {/* Video Info */}
      <div className="mt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <div className="mt-2 text-sm text-gray-600">
              <span>{video.view_count.toLocaleString()} 回視聴</span>
              <span className="mx-2">•</span>
              <span>{new Date(video.created_at).toLocaleDateString('ja-JP')}</span>
            </div>
          </div>

          {/* Edit/Delete buttons for authenticated users */}
          {isAuthenticated && (
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/videos/${video.id}/edit`)}
                className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
              >
                編集
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50"
              >
                削除
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <p className="whitespace-pre-wrap">{video.description}</p>
        </div>
      </div>
    </div>
  );
}
