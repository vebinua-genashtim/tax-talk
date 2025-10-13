import { Play, Lock } from 'lucide-react';
import { Video } from '../lib/supabase';

interface MobileVideoCardProps {
  video: Video;
  hasAccess: boolean;
  onClick: () => void;
}

export function MobileVideoCard({ video, hasAccess, onClick }: MobileVideoCardProps) {
  return (
    <div
      onClick={onClick}
      className="relative w-full aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group shadow-lg"
    >
      <img
        src={video.thumbnail_url}
        alt={video.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.src = 'https://images.pexels.com/photos/6863332/pexels-photo-6863332.jpeg?auto=compress&cs=tinysrgb&w=400';
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
        {video.is_new && (
          <div className="px-2 py-1 rounded-md text-white text-xs font-bold" style={{ background: '#827546' }}>
            NEW
          </div>
        )}
        <div className="px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm text-white text-xs font-medium">
          {video.duration_minutes}m
        </div>
      </div>

      {!hasAccess && (
        <div className="absolute top-2 left-2">
          <div className="p-1.5 rounded-md bg-black/70 backdrop-blur-sm">
            <Lock className="w-3 h-3 text-white" />
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-3">
        <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
          {video.title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {!hasAccess && (
              <span className="px-2 py-1 rounded-md text-white text-xs font-bold shadow-md" style={{ background: 'linear-gradient(135deg, #827546 0%, #a08f5a 100%)' }}>
                ${video.price.toFixed(0)}
              </span>
            )}
            <span className="text-gray-300 text-xs">{video.view_count} views</span>
          </div>
          <div className="p-2 rounded-full bg-white/95 backdrop-blur-sm group-hover:bg-white transition-all">
            <Play className="w-3 h-3 text-gray-900" fill="currentColor" />
          </div>
        </div>
      </div>
    </div>
  );
}
