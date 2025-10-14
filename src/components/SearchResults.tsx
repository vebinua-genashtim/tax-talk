import { Video } from '../lib/supabase';
import { VideoCard } from './VideoCard';
import { Search } from 'lucide-react';

interface SearchResultsProps {
  videos: Video[];
  hasAccess: (videoId: string) => boolean;
  onClick: (video: Video) => void;
  summary: string;
}

export function SearchResults({ videos, hasAccess, onClick, summary }: SearchResultsProps) {
  if (videos.length === 0) {
    return (
      <div className="px-4 sm:px-6 md:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
            <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
            <p className="text-white/60">
              Try adjusting your search query or filters to find what you're looking for.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6">
      <div className="mb-6">
        <p className="text-white/60 text-sm">
          {summary}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            hasAccess={hasAccess(video.id)}
            onClick={onClick}
          />
        ))}
      </div>
    </div>
  );
}
