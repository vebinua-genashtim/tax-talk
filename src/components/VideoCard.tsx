import { Clock, Lock } from 'lucide-react';
import { Video } from '../lib/supabase';

interface VideoCardProps {
  video: Video;
  hasAccess: boolean;
  onClick: (video: Video) => void;
}

export function VideoCard({ video, hasAccess, onClick }: VideoCardProps) {
  return (
    <div
      className="cursor-pointer transition-all duration-200 active:scale-95 sm:hover:scale-105"
      onClick={() => onClick(video)}
    >
      <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-gray-900 shadow-lg">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {!hasAccess && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-black/90 backdrop-blur-sm p-3 rounded-full">
              <Lock className="w-7 h-7 text-white" />
            </div>
          </div>
        )}

        <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{video.duration_minutes}m</span>
        </div>

        {video.is_new && (
          <div className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-md" style={{ background: '#827546' }}>
            NEW
          </div>
        )}

        {!hasAccess && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md">
            ${video.price.toFixed(2)}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2 sm:p-2.5">
          <h3 className="font-semibold text-white text-xs sm:text-sm line-clamp-2 leading-snug">
            {video.title}
          </h3>
        </div>
      </div>
    </div>
  );
}
