import { Video } from '../data/mockData';
import { VideoRow } from './VideoRow';
import { Sparkles } from 'lucide-react';

interface RecommendedForYouProps {
  recommendations: Video[];
  hasAccess: (videoId: string) => boolean;
  onClick: (video: Video) => void;
}

export function RecommendedForYou({ recommendations, hasAccess, onClick }: RecommendedForYouProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-10 px-4 sm:px-6 md:px-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 p-2 rounded-xl">
          <Sparkles className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Recommended for You
        </h2>
      </div>
      <p className="text-white/60 text-sm mb-5">
        Based on your watch history and interests
      </p>
      <VideoRow videos={recommendations} hasAccess={hasAccess} onClick={onClick} />
    </div>
  );
}
