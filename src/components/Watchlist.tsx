import { Video } from '../data/mockData';
import { VideoRow } from './VideoRow';
import { Bookmark } from 'lucide-react';

interface WatchlistProps {
  videos: Video[];
  hasAccess: (videoId: string) => boolean;
  onClick: (video: Video) => void;
}

export function Watchlist({ videos, hasAccess, onClick }: WatchlistProps) {
  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="mb-10 px-4 sm:px-6 md:px-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 p-2 rounded-xl">
          <Bookmark className="w-5 h-5 text-pink-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          My Watchlist
        </h2>
      </div>
      <p className="text-white/60 text-sm mb-5">
        Videos you've saved for later
      </p>
      <VideoRow videos={videos} hasAccess={hasAccess} onClick={onClick} />
    </div>
  );
}
