import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl: string;
  videoId: string;
}

export default function VideoPlayer({ videoUrl, posterUrl, videoId }: VideoPlayerProps) {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [watchProgress, setWatchProgress] = useState<any>(null);
  const [showControls, setShowControls] = useState(true);

  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    player.muted = false;
  });

  useEffect(() => {
    if (user && videoId) {
      loadWatchProgress();
    }
  }, [user, videoId]);

  useEffect(() => {
    if (!player) return;

    const subscription = player.addListener('statusChange', (status) => {
      if (status === 'idle' && player.duration > 0 && player.currentTime >= player.duration - 1) {
        setIsPlaying(false);
        setShowControls(true);
        if (user && player.duration) {
          saveWatchProgress(player.duration, player.duration, true);
        }
      }

      if (status === 'playing' && user && player.duration) {
        const currentTime = player.currentTime;
        const duration = player.duration;
        saveWatchProgress(currentTime, duration);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player, user]);

  const loadWatchProgress = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('watch_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('video_id', videoId)
        .maybeSingle();

      if (data) {
        setWatchProgress(data);
      }
    } catch (error) {
      console.error('Error loading watch progress:', error);
    }
  };

  const saveWatchProgress = async (currentTime: number, duration: number, completed: boolean = false) => {
    if (!user || !videoId) return;

    try {
      const progressData = {
        user_id: user.id,
        video_id: videoId,
        progress_seconds: currentTime,
        duration_seconds: duration,
        completed,
        last_watched_at: new Date().toISOString(),
      };

      await supabase
        .from('watch_progress')
        .upsert(progressData, {
          onConflict: 'user_id,video_id',
        });
    } catch (error) {
      console.error('Error saving watch progress:', error);
    }
  };

  const handlePlayPress = async (resumeFromStart: boolean = false) => {
    if (!player) return;

    setIsLoading(true);

    if (!resumeFromStart && watchProgress && watchProgress.progress_seconds > 0) {
      player.currentTime = watchProgress.progress_seconds;
    } else {
      player.currentTime = 0;
    }

    player.play();
    setShowControls(false);
    setIsPlaying(true);
    setIsLoading(false);
  };

  const hasStarted = watchProgress && watchProgress.progress_seconds > 0;
  const isCompleted = watchProgress?.completed || false;

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        contentFit="contain"
        nativeControls={isPlaying}
      />

      {showControls && !isPlaying && (
        <View style={styles.overlay}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <View style={styles.controlsContainer}>
              {!user ? (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => handlePlayPress(true)}
                >
                  <Text style={styles.buttonText}>▶ Watch Preview</Text>
                </TouchableOpacity>
              ) : hasStarted && !isCompleted ? (
                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => handlePlayPress(false)}
                  >
                    <Text style={styles.buttonText}>▶ Resume</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => handlePlayPress(true)}
                  >
                    <Text style={styles.buttonTextSmall}>↻ From Start</Text>
                  </TouchableOpacity>
                </View>
              ) : isCompleted ? (
                <View>
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓ Completed</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.primaryButton, { marginTop: 16 }]}
                    onPress={() => handlePlayPress(true)}
                  >
                    <Text style={styles.buttonText}>↻ Watch Again</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => handlePlayPress(true)}
                >
                  <Text style={styles.buttonText}>▶ Watch Now</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    padding: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#827546',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextSmall: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  completedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
