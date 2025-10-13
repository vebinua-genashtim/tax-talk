import { VideoCard } from './VideoCard';
import { Video } from '../lib/supabase';

interface ContinueWatchingRowProps {
  videos: Video[];
  watchProgress: Map<string, { progress_seconds: number; duration_seconds: number }>;
  hasAccess: (videoId: string) => boolean;
  onClick: (video: Video) => void;
}

export function ContinueWatchingRow({ videos, watchProgress, hasAccess, onClick }: ContinueWatchingRowProps) {
  return (
    <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {videos.map((video) => {
        const progress = watchProgress.get(video.id);
        const progressPercent = progress
          ? (progress.progress_seconds / progress.duration_seconds) * 100
          : 0;

        return (
          <div key={video.id} className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px]">
            <VideoCard
              video={video}
              hasAccess={hasAccess(video.id)}
              onClick={onClick}
              progress={progressPercent}
            />
          </div>
        );
      })}
    </div>
  );
}
