"use client";

import { useEffect, useState, useRef } from "react";
import { Video } from "@/types";
import { api } from "@/lib/api";
import VideoCard from "@/components/VideoCard";

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState("");

  const observerTarget = useRef<HTMLDivElement>(null);
  const LIMIT = 15;
  const MIN_LOADING_TIME = 500;

  // Load initial videos
  useEffect(() => {
    loadVideos(true);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadVideos(false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, offset]);

  const loadVideos = async (reset: boolean = false) => {
    if (isLoading) return;

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const currentOffset = reset ? 0 : offset;
      const newVideos = await api.getVideos(LIMIT, currentOffset);

      // Ensure minimum loading time for better UX
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < MIN_LOADING_TIME) {
        await new Promise((resolve) =>
          setTimeout(resolve, MIN_LOADING_TIME - elapsedTime)
        );
      }

      if (reset) {
        setVideos(newVideos);
        setOffset(LIMIT);
        setLoading(false);
      } else {
        setVideos((prev) => [...prev, ...newVideos]);
        setOffset((prev) => prev + LIMIT);
      }

      setHasMore(newVideos.length === LIMIT);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "動画の読み込みに失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  };

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
      {videos.length === 0 ? (
        <div className="text-center text-gray-500 py-12">動画がありません</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-4 gap-y-8">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {/* Loading indicator and observer target */}
          <div ref={observerTarget} className="flex justify-center py-8">
            {isLoading && (
              <div className="text-center text-gray-500">読み込み中...</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
