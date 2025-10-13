import { Lock, PlayCircle } from 'lucide-react';
import { Video } from '../lib/supabase';

interface HeroProps {
  video?: Video;
  onPlay: (video: Video) => void;
  onSubscribe: () => void;
  isSubscribed?: boolean;
  isLoggedIn?: boolean;
}

export function Hero({ video, onPlay, onSubscribe, isSubscribed, isLoggedIn }: HeroProps) {
  if (!video) return null;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <img
        src="/hero-page.png"
        alt="Tax Professional"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />

      <div className="relative h-full flex items-center px-4 sm:px-6 md:px-12 lg:px-16">
        <div className="max-w-4xl">
          {!isLoggedIn ? (
            <>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
                Your Gateway to Tax Knowledge
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 md:mb-10 max-w-2xl leading-relaxed">
                Gain access to exclusive video content, expert discussions, and tax learning resources designed for professionals in Singapore.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={onSubscribe}
                  className="flex items-center justify-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 rounded-md text-white font-semibold text-base sm:text-lg transition hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #827546 0%, #a08f5a 100%)' }}
                >
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Subscribe</span>
                </button>

                <button
                  onClick={() => onPlay(video)}
                  className="flex items-center justify-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 rounded-md font-semibold text-base sm:text-lg transition hover:bg-white/20 border-2 border-white text-white"
                >
                  <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Preview Content</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
                {isSubscribed ? 'Welcome Back to Tax Academy' : 'Continue Your Tax Learning Journey'}
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 md:mb-10 max-w-2xl leading-relaxed">
                {isSubscribed
                  ? 'Explore our complete library of tax training videos and stay updated with the latest tax regulations.'
                  : 'Browse our extensive collection of tax training videos. Purchase individual courses or subscribe for unlimited access.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {!isSubscribed && (
                  <button
                    onClick={onSubscribe}
                    className="flex items-center justify-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 rounded-md text-white font-semibold text-base sm:text-lg transition hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #827546 0%, #a08f5a 100%)' }}
                  >
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Subscribe</span>
                  </button>
                )}

                <button
                  onClick={() => onPlay(video)}
                  className="flex items-center justify-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 rounded-md font-semibold text-base sm:text-lg transition hover:bg-white/20 border-2 border-white text-white"
                >
                  <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{isSubscribed ? 'Start Watching' : 'Browse Videos'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
