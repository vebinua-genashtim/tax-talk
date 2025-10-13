import { X, Lock, Play } from 'lucide-react';
import { Video } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { VideoFeedback } from './VideoFeedback';
import { VideoPlayer } from './VideoPlayer';

interface VideoModalProps {
  isOpen: boolean;
  video: Video | null;
  onClose: () => void;
  hasAccess: boolean;
  onPurchase: (video: Video) => void;
}

export function VideoModal({ isOpen, video, onClose, hasAccess, onPurchase }: VideoModalProps) {
  const { user, profile } = useAuth();

  if (!isOpen || !video) return null;

  const isSubscriber = profile?.subscription_status === 'active';
  const isPayPerView = user && profile?.subscription_status === 'free';
  const isFreeUser = !user;

  const canWatchFull = hasAccess || isSubscriber;
  const videoUrl = canWatchFull ? video.full_video_url : video.trailer_url;

  const getAccessType = () => {
    if (!user) return 'free';
    if (isSubscriber) return 'subscriber';
    if (hasAccess) return 'purchased';
    return 'payPerView';
  };

  const accessType = getAccessType();

  console.log('VideoModal Debug:', {
    user: !!user,
    profile: profile,
    isSubscriber,
    hasAccess,
    canWatchFull,
    accessType,
    videoId: video.id
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative">
            <VideoPlayer
              videoUrl={videoUrl}
              posterUrl={video.thumbnail_url}
              videoId={video.id}
            />

            {canWatchFull && user && (
              <div className="absolute bottom-8 right-8 z-10">
                <VideoFeedback videoId={video.id} />
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#033a66' }}>
                  {video.title}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <span>{video.duration_minutes} minutes</span>
                  <span>•</span>
                  <span>{video.view_count} views</span>
                  <span>•</span>
                  <span className="font-semibold" style={{ color: '#827546' }}>
                    ${video.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {accessType === 'free' && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <Play className="w-5 h-5 mt-0.5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-800">
                        Preview Mode - No Login Required
                      </p>
                      <p className="text-sm text-gray-600">
                        You're watching a preview. Sign in to purchase this video for ${video.price.toFixed(2)} or subscribe for unlimited access to all videos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {accessType === 'payPerView' && (
              <div className="bg-orange-50 border-l-4 p-4 mb-6 rounded" style={{ borderColor: '#827546' }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <Lock className="w-5 h-5 mt-0.5" style={{ color: '#827546' }} />
                    <div>
                      <p className="font-semibold text-gray-800">
                        Preview Mode - Pay-Per-View User
                      </p>
                      <p className="text-sm text-gray-600">
                        Purchase this video for ${video.price.toFixed(2)} to watch the full training, or subscribe for unlimited access to all videos.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onPurchase(video)}
                    className="px-6 py-2 rounded text-white font-semibold transition hover:scale-105 whitespace-nowrap shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #827546 0%, #a08f5a 100%)', boxShadow: '0 4px 15px rgba(130, 117, 70, 0.4)' }}
                  >
                    Buy Access
                  </button>
                </div>
              </div>
            )}

            {accessType === 'purchased' && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
                <div className="flex items-center space-x-3">
                  <Play className="w-5 h-5 text-blue-600 fill-current" />
                  <div>
                    <p className="font-semibold text-blue-800">
                      Full Access - You purchased this video
                    </p>
                    <p className="text-sm text-blue-600">
                      You have lifetime access to this training content
                    </p>
                  </div>
                </div>
              </div>
            )}

            {accessType === 'subscriber' && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
                <div className="flex items-center space-x-3">
                  <Play className="w-5 h-5 text-green-600 fill-current" />
                  <div>
                    <p className="font-semibold text-green-800">
                      Full Access - Active Subscription
                    </p>
                    <p className="text-sm text-green-600">
                      You have unlimited access to all training videos
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-gray-700 leading-relaxed mb-6">
              {video.description}
            </p>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-800 mb-4">About Tax Academy Singapore</h3>
              <p className="text-gray-600 text-sm">
                Tax Academy Singapore provides comprehensive tax training and professional development
                for tax practitioners, accountants, and finance professionals. Our expert-led courses
                cover all aspects of Singapore taxation, from GST to corporate tax planning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
