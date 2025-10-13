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

        <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 bg-black/75 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg flex items-center gap-1 sm:gap-1.5">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>{video.duration_minutes}m</span>
        </div>

        {video.is_new && (
          <div className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg" style={{ background: '#827546' }}>
            NEW
          </div>
        )}

        {!hasAccess && (
          <div className="absolute top-2 sm:top-2.5 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-sm text-white text-sm sm:text-base font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg">
            ${video.price.toFixed(2)}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2.5 sm:p-3 md:p-4">
          <h3 className="font-semibold text-white text-sm sm:text-base line-clamp-2 leading-snug">
            {video.title}
          </h3>
        </div>
      </div>
    </div>
  );
}
