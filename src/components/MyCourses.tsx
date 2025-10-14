import { Video } from '../data/mockData';
import { VideoCard } from './VideoCard';
import { Crown, ShoppingBag } from 'lucide-react';

interface MyCoursesProps {
  subscriptionVideos: Video[];
  purchasedVideos: Video[];
  hasAccess: (videoId: string) => boolean;
  onClick: (video: Video) => void;
  isSubscribed: boolean;
}

export function MyCourses({
  subscriptionVideos,
  purchasedVideos,
  hasAccess,
  onClick,
  isSubscribed
}: MyCoursesProps) {
  const hasCourses = isSubscribed || purchasedVideos.length > 0;

  if (!hasCourses) {
    return null;
  }

  return (
    <div className="mb-10 px-4 sm:px-6 md:px-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white tracking-tight">
        My Courses
      </h2>

      {isSubscribed && subscriptionVideos.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-amber-500/20 p-1.5 rounded-lg">
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Premium Access</h3>
            <span className="text-white/60 text-sm ml-auto">
              {subscriptionVideos.length} video{subscriptionVideos.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {subscriptionVideos.slice(0, 8).map(video => (
              <VideoCard
                key={video.id}
                video={video}
                hasAccess={hasAccess(video.id)}
                onClick={onClick}
              />
            ))}
          </div>
          {subscriptionVideos.length > 8 && (
            <p className="text-white/60 text-sm mt-4">
              And {subscriptionVideos.length - 8} more video{subscriptionVideos.length - 8 !== 1 ? 's' : ''}...
            </p>
          )}
        </div>
      )}

      {purchasedVideos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-500/20 p-1.5 rounded-lg">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Purchased Videos</h3>
            <span className="text-white/60 text-sm ml-auto">
              {purchasedVideos.length} video{purchasedVideos.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {purchasedVideos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                hasAccess={hasAccess(video.id)}
                onClick={onClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
