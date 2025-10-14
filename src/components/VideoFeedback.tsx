import { ThumbsDown, Heart, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface VideoFeedbackProps {
  videoId: string;
}

type FeedbackType = 'not_for_me' | 'like' | 'love' | null;

export function VideoFeedback({ videoId }: VideoFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFeedback();
    }
  }, [videoId, user]);

  const loadFeedback = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('video_feedback')
      .select('feedback_type')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .maybeSingle();

    if (data) {
      setFeedback(data.feedback_type as FeedbackType);
    }
  };

  const handleFeedback = async (type: 'not_for_me' | 'like' | 'love') => {
    if (!user) return;

    setLoading(true);

    try {
      if (feedback === type) {
        await supabase
          .from('video_feedback')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', videoId);
        setFeedback(null);
      } else {
        await supabase
          .from('video_feedback')
          .upsert({
            user_id: user.id,
            video_id: videoId,
            feedback_type: type,
          });
        setFeedback(type);
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-2">
      <button
        onClick={() => handleFeedback('not_for_me')}
        disabled={loading}
        className={`p-2 rounded-full border-2 transition-all ${
          feedback === 'not_for_me'
            ? 'border-white bg-white text-black'
            : 'border-white/60 text-white hover:border-white hover:scale-110'
        }`}
        title="Not for me"
      >
        <ThumbsDown className="w-5 h-5" />
      </button>

      <button
        onClick={() => handleFeedback('like')}
        disabled={loading}
        className={`p-2 rounded-full border-2 transition-all ${
          feedback === 'like'
            ? 'border-white bg-white text-black'
            : 'border-white/60 text-white hover:border-white hover:scale-110'
        }`}
        title="I like this"
      >
        <Heart className="w-5 h-5" fill={feedback === 'like' ? 'currentColor' : 'none'} />
      </button>

      <button
        onClick={() => handleFeedback('love')}
        disabled={loading}
        className={`p-2 rounded-full border-2 transition-all ${
          feedback === 'love'
            ? 'border-white bg-white text-black'
            : 'border-white/60 text-white hover:border-white hover:scale-110'
        }`}
        title="Love this"
      >
        <Sparkles className="w-5 h-5" fill={feedback === 'love' ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
