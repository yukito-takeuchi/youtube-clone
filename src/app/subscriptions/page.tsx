'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video } from '@/types';
import { api } from '@/lib/api';
import VideoCard from '@/components/VideoCard';
import { useAuth } from '@/contexts/AuthContext';

export default function SubscriptionsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchSubscriptionFeed = async () => {
      try {
        const data = await api.getSubscriptionFeed(50, 0);
        setVideos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '登録チャンネルの動画の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionFeed();
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[2000px] mx-auto px-6 py-6">
      <h1 className="text-2xl font-bold mb-6">登録チャンネル</h1>
      {videos.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="mb-2">登録チャンネルの動画がありません</p>
          <p className="text-sm">チャンネルを登録すると、ここに最新の動画が表示されます</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
