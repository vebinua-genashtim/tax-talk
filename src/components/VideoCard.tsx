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
      className="cursor-pointer transition-all duration-200 hover:scale-105"
      onClick={() => onClick(video)}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-900 shadow-lg">
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

        <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{video.duration_minutes}m</span>
        </div>

        {video.is_new && (
          <div className="absolute top-2.5 right-2.5 text-white text-sm font-bold px-3 py-1.5 rounded-lg" style={{ background: '#827546' }}>
            NEW
          </div>
        )}

        {!hasAccess && (
          <div className="absolute bottom-16 right-2.5 bg-black/75 backdrop-blur-sm text-white text-base font-bold px-3 py-1.5 rounded-lg">
            ${video.price.toFixed(2)}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-semibold text-white text-base line-clamp-2 leading-snug">
            {video.title}
          </h3>
        </div>
      </div>
    </div>
  );
}
