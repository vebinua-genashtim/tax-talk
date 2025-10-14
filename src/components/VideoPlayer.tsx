import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Settings, Gauge, Subtitles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl: string;
  videoId: string;
  onTimeUpdate?: (currentTime: number) => void;
}

interface WatchProgress {
  progress_seconds: number;
  duration_seconds: number;
  completed: boolean;
}

export function VideoPlayer({ videoUrl, posterUrl, videoId, onTimeUpdate }: VideoPlayerProps) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [watchProgress, setWatchProgress] = useState<WatchProgress | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showCaptions, setShowCaptions] = useState(false);
  const lastSaveTimeRef = useRef<number>(0);

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  useEffect(() => {
    if (user && videoId) {
      loadWatchProgress();
    }
  }, [user, videoId]);

  const loadWatchProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('watch_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('video_id', videoId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading watch progress:', error);
        return;
      }

      if (data) {
        setWatchProgress(data);
      }
    } catch (error) {
      console.error('Error loading watch progress:', error);
    }
  };

  const saveWatchProgress = async (currentTime: number, duration: number, completed: boolean = false) => {
    if (!user || !videoId) return;

    const now = Date.now();
    if (!completed && now - lastSaveTimeRef.current < 5000) {
      return;
    }
    lastSaveTimeRef.current = now;

    try {
      const progressData = {
        user_id: user.id,
        video_id: videoId,
        progress_seconds: currentTime,
        duration_seconds: duration,
        completed,
        last_watched_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('watch_progress')
        .upsert(progressData, {
          onConflict: 'user_id,video_id',
        });

      if (error) {
        console.error('Error saving watch progress:', error);
      } else {
        setWatchProgress({
          progress_seconds: currentTime,
          duration_seconds: duration,
          completed,
        });
      }
    } catch (error) {
      console.error('Error saving watch progress:', error);
    }
  };

  const handlePlay = async (resumeFromStart: boolean = false) => {
    if (!videoRef.current) return;

    if (!resumeFromStart && watchProgress && watchProgress.progress_seconds > 0 && !watchProgress.completed) {
      videoRef.current.currentTime = watchProgress.progress_seconds;
    } else {
      videoRef.current.currentTime = 0;
    }

    setShowControls(false);
    setIsPlaying(true);

    try {
      await videoRef.current.play();
    } catch (error) {
      console.error('Error playing video:', error);
    }
  };

  const handleResume = () => {
    handlePlay(false);
  };

  const handleWatchFromStart = () => {
    handlePlay(true);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;

    if (onTimeUpdate) {
      onTimeUpdate(currentTime);
    }

    if (user && duration > 0) {
      const isCompleted = duration - currentTime < 5;
      saveWatchProgress(currentTime, duration, isCompleted);
    }
  };

  const handlePause = () => {
    if (!videoRef.current) return;

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;

    if (user && duration > 0) {
      saveWatchProgress(currentTime, duration, false);
    }
  };

  const handleEnded = () => {
    if (!videoRef.current) return;

    const duration = videoRef.current.duration;

    if (user && duration > 0) {
      saveWatchProgress(duration, duration, true);
    }

    setIsPlaying(false);
    setShowControls(true);
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  const toggleCaptions = () => {
    if (videoRef.current && videoRef.current.textTracks.length > 0) {
      const track = videoRef.current.textTracks[0];
      track.mode = track.mode === 'showing' ? 'hidden' : 'showing';
      setShowCaptions(track.mode === 'showing');
    }
  };

  const hasStarted = watchProgress && watchProgress.progress_seconds > 0;
  const isCompleted = watchProgress?.completed || false;
  const progressPercentage = watchProgress && watchProgress.duration_seconds > 0
    ? (watchProgress.progress_seconds / watchProgress.duration_seconds) * 100
    : 0;

  return (
    <div className="relative aspect-video bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        controls={isPlaying}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
      >
        Your browser does not support the video tag.
      </video>

      {showControls && !isPlaying && (
        <div className="absolute inset-0 flex flex-col justify-between bg-black/50">
          <div className="flex justify-end p-4 gap-2">
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="p-2 rounded-lg bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors flex items-center gap-2"
                title="Playback speed"
              >
                <Gauge className="w-5 h-5 text-white" />
                <span className="text-white text-sm font-medium">{playbackSpeed}x</span>
              </button>
              {showSpeedMenu && (
                <div className="absolute top-full right-0 mt-2 bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden z-10">
                  {speedOptions.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors ${
                        speed === playbackSpeed ? 'bg-white/20' : ''
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={toggleCaptions}
              className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
                showCaptions ? 'bg-white/20' : 'bg-black/50 hover:bg-black/70'
              }`}
              title="Toggle captions"
            >
              <Subtitles className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex items-end justify-between px-8 pb-8">
            <div className="text-left">
              {!user ? (
                <button
                  onClick={() => handlePlay(true)}
                  className="px-6 py-3 rounded-lg text-white font-semibold text-base transition hover:scale-105 flex items-center gap-2 shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #827546 0%, #a08f5a 100%)' }}
                >
                  <Play className="w-5 h-5 fill-current" />
                  Watch Preview
                </button>
              ) : hasStarted && !isCompleted ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleResume}
                    className="px-6 py-3 rounded-lg text-white font-semibold text-base transition hover:scale-105 flex items-center gap-2 shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #827546 0%, #a08f5a 100%)' }}
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Resume
                  </button>
                  <button
                    onClick={handleWatchFromStart}
                    className="px-5 py-3 rounded-lg text-white font-medium text-base transition hover:scale-105 flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Watch from Start
                  </button>
                </div>
              ) : isCompleted ? (
                <div className="flex flex-col gap-4">
                  <div className="bg-green-500/20 backdrop-blur-sm rounded-lg px-6 py-3 mb-2">
                    <p className="text-white font-semibold">Video completed!</p>
                    <p className="text-white/80 text-sm">Watch again?</p>
                  </div>
                  <button
                    onClick={handleWatchFromStart}
                    className="px-6 py-3 rounded-lg text-white font-semibold text-base transition hover:scale-105 flex items-center gap-2 shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #827546 0%, #a08f5a 100%)' }}
                  >
                    <RotateCcw className="w-5 h-5" />
                    Watch Again
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handlePlay(true)}
                  className="px-6 py-3 rounded-lg text-white font-semibold text-base transition hover:scale-105 flex items-center gap-2 shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #827546 0%, #a08f5a 100%)' }}
                >
                  <Play className="w-5 h-5 fill-current" />
                  Watch Now
                </button>
              )}
            </div>
            <div className="flex-shrink-0">
              {/* Spacer for feedback buttons */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
