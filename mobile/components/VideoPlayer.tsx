import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl: string;
  videoId: string;
}

export default function VideoPlayer({ videoUrl, posterUrl, videoId }: VideoPlayerProps) {
  const { user } = useAuth();
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [watchProgress, setWatchProgress] = useState<any>(null);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (user && videoId) {
      loadWatchProgress();
    }
  }, [user, videoId]);

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
    if (!videoRef.current) return;

    setIsLoading(true);

    if (!resumeFromStart && watchProgress && watchProgress.progress_seconds > 0) {
      await videoRef.current.setPositionAsync(watchProgress.progress_seconds * 1000);
    }

    await videoRef.current.playAsync();
    setShowControls(false);
    setIsPlaying(true);
    setIsLoading(false);
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    if (status.didJustFinish) {
      setIsPlaying(false);
      setShowControls(true);
      if (user && status.durationMillis) {
        saveWatchProgress(status.durationMillis / 1000, status.durationMillis / 1000, true);
      }
    }

    if (status.isPlaying && user && status.durationMillis) {
      const currentTime = status.positionMillis / 1000;
      const duration = status.durationMillis / 1000;
      saveWatchProgress(currentTime, duration);
    }
  };

  const hasStarted = watchProgress && watchProgress.progress_seconds > 0;
  const isCompleted = watchProgress?.completed || false;

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        posterSource={{ uri: posterUrl }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={false}
        isLooping={false}
        style={styles.video}
        useNativeControls={isPlaying}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
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
