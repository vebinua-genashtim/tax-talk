import { Clock, Lock } from 'lucide-react';
import { Video } from '../lib/supabase';

interface VideoCardProps {
  video: Video;
  hasAccess: boolean;
  onClick: (video: Video) => void;
  progress?: number;
  showPrice?: boolean; // Optional prop to control price visibility
}

export function VideoCard({ 
  video, 
  hasAccess, 
  onClick, 
  progress, 
  showPrice = true // Default to true so existing usage doesn't break
}: VideoCardProps) {
  return (
    <div
      className="cursor-pointer transition-all duration-200 active:scale-[0.98] hover:scale-[1.02]"
      onClick={() => onClick(video)}
    >
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 shadow-xl">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {!hasAccess && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2 py-1 rounded-lg flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{video.duration_minutes}m</span>
        </div>

        {video.is_new && (
          <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-lg">
            NEW
          </div>
        )}

        {/* Only show price if showPrice is true, user lacks access, and video has a price */}
        {!hasAccess && showPrice && video.price !== undefined && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            ${video.price.toFixed(2)}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3">
          <h3 className="font-semibold text-white text-sm line-clamp-2 leading-snug">
            {video.title}
          </h3>
          {progress !== undefined && progress > 0 && (
            <div className="mt-2 w-full bg-white/20 rounded-full h-1 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}