import Link from 'next/link';
import { Video } from '@/types';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/videos/${video.id}`} className="block group">
      <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
        {/* Thumbnail */}
        <div className="aspect-video bg-gray-200 relative">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Thumbnail
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 line-clamp-2">
            {video.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {video.description}
          </p>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span>{video.view_count.toLocaleString()} 回視聴</span>
            <span className="mx-2">•</span>
            <span>{new Date(video.created_at).toLocaleDateString('ja-JP')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
