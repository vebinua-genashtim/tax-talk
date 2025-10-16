import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  Dimensions,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase, Video, testConnection } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;
const HERO_CARD_WIDTH = width * 0.85;

export default function HomeScreen({ navigation }: Props) {
  const { user, profile } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [watchProgress, setWatchProgress] = useState<Map<string, { progress_seconds: number; duration_seconds: number; completed: boolean }>>(new Map());

  useEffect(() => {
    const initializeData = async () => {
      const connectionTest = await testConnection();
      console.log('Connection test result:', connectionTest);

      loadVideos();
      if (user) {
        loadWatchProgress();
      }
    };

    initializeData();
  }, [user]);

  const loadVideos = async () => {
    try {
      console.log('Loading videos from Supabase...');
      const { data, error } = await supabase
        .from('videos')
        .select('*, category:categories(name)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Videos loaded successfully:', data?.length || 0);
      setVideos(data || []);
      setError(null);
    } catch (error) {
      console.error('Error loading videos:', error);
      let errorMsg = 'Failed to load videos';

      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          errorMsg = 'Network connection failed. Please check your internet connection and try again.';
        } else if (error.message.includes('fetch')) {
          errorMsg = 'Unable to connect to server. Please check your internet connection.';
        } else {
          errorMsg = error.message;
        }
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadWatchProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('watch_progress')
        .select('video_id, progress_seconds, duration_seconds, completed')
        .eq('user_id', user.id);

      if (error) throw error;

      const progressMap = new Map(
        data?.map(p => [
          p.video_id,
          {
            progress_seconds: p.progress_seconds,
            duration_seconds: p.duration_seconds,
            completed: p.completed
          }
        ]) || []
      );
      setWatchProgress(progressMap);
    } catch (error) {
      console.error('Error loading watch progress:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadVideos();
  };

  const featuredVideos = videos.filter(v => v.is_featured).slice(0, 6);
  const newVideos = videos.filter(v => v.is_new).slice(0, 6);
  const popularVideos = [...videos].sort((a, b) => b.view_count - a.view_count).slice(0, 6);

  const continueWatchingVideos = videos.filter(video => {
    const progress = watchProgress.get(video.id);
    return progress && !progress.completed && progress.progress_seconds > 0;
  }).slice(0, 6);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserName = () => {
    if (user?.email) {
      const name = user.email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'There';
  };

  const groupedVideos = videos.reduce((acc, video) => {
    const categoryName = video.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(video);
    return acc;
  }, {} as Record<string, Video[]>);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{getUserName()}</Text>
        </View>
        {user ? (
          <TouchableOpacity
            style={styles.accountButton}
            onPress={() => navigation.navigate('Account')}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getUserName().charAt(0)}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>


      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {user && continueWatchingVideos.length > 0 && (
          <View style={styles.continueWatchingSection}>
            <TouchableOpacity
              style={styles.continueCard}
              onPress={() => navigation.navigate('VideoDetail', { video: continueWatchingVideos[0] })}
            >
              <Image
                source={{ uri: continueWatchingVideos[0].thumbnail_url }}
                style={styles.continueImage}
                resizeMode="cover"
              />
              <View style={styles.continueOverlay}>
                <View style={styles.continueTag}>
                  <Text style={styles.continueTagText}>Continue Watching</Text>
                </View>
                <View style={styles.continueInfo}>
                  <Text style={styles.continueTitle} numberOfLines={2}>
                    {continueWatchingVideos[0].title}
                  </Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${(
                              (watchProgress.get(continueWatchingVideos[0].id)?.progress_seconds || 0) /
                              (watchProgress.get(continueWatchingVideos[0].id)?.duration_seconds || 1)
                            ) * 100}%`
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.round(
                        ((watchProgress.get(continueWatchingVideos[0].id)?.progress_seconds || 0) /
                          (watchProgress.get(continueWatchingVideos[0].id)?.duration_seconds || 1)) *
                          100
                      )}%
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="What do you want to learn today?"
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading videos...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadVideos}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && videos.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No videos available</Text>
          </View>
        )}


        {featuredVideos.length > 0 && (
          <View style={styles.categorySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.categoryTitle}>Recommended for You</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.videoRow}
            >
              {featuredVideos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  style={styles.recommendedCard}
                  onPress={() => navigation.navigate('VideoDetail', { video })}
                >
                  <Image
                    source={{ uri: video.thumbnail_url }}
                    style={styles.recommendedImage}
                    resizeMode="cover"
                  />
                  <View style={styles.recommendedContent}>
                    <Text style={styles.videoTitle} numberOfLines={2}>
                      {video.title}
                    </Text>
                    <View style={styles.videoMeta}>
                      <Text style={styles.metaText}>⭐ 4.7</Text>
                    </View>
                    <View style={styles.videoMeta}>
                      <Text style={styles.metaText}>{video.duration_minutes} min</Text>
                      <Text style={styles.metaText}>•</Text>
                      <Text style={styles.priceText}>${video.price.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.enrollButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        if (profile?.subscription_status === 'active') {
                          navigation.navigate('VideoDetail', { video });
                        } else {
                          navigation.navigate('Subscription');
                        }
                      }}
                    >
                      <Text style={styles.enrollButtonText}>
                        {profile?.subscription_status === 'active' ? 'Watch Now' : 'Subscribe'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {newVideos.length > 0 && (
          <View style={styles.categorySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.categoryTitle}>New Releases</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.videoRow}
            >
              {newVideos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  style={styles.videoCard}
                  onPress={() => navigation.navigate('VideoDetail', { video })}
                >
                  <Image
                    source={{ uri: video.thumbnail_url }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.videoTitle} numberOfLines={2}>
                      {video.title}
                    </Text>
                    <View style={styles.videoMeta}>
                      <Text style={styles.metaText}>{video.duration_minutes} min</Text>
                      <Text style={styles.metaText}>•</Text>
                      <Text style={styles.priceText}>${video.price.toFixed(2)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {popularVideos.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>Most Popular</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.videoRow}
            >
              {popularVideos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  style={styles.videoCard}
                  onPress={() => navigation.navigate('VideoDetail', { video })}
                >
                  <Image
                    source={{ uri: video.thumbnail_url }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.videoTitle} numberOfLines={2}>
                      {video.title}
                    </Text>
                    <View style={styles.videoMeta}>
                      <Text style={styles.metaText}>{video.duration_minutes} min</Text>
                      <Text style={styles.metaText}>•</Text>
                      <Text style={styles.priceText}>${video.price.toFixed(2)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.allVideosHeader}>
          <Text style={styles.allVideosTitle}>Browse by Category</Text>
        </View>

        {Object.entries(groupedVideos).map(([category, categoryVideos]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.videoRow}
            >
              {categoryVideos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  style={styles.videoCard}
                  onPress={() => navigation.navigate('VideoDetail', { video })}
                >
                  <Image
                    source={{ uri: video.thumbnail_url }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.videoTitle} numberOfLines={2}>
                      {video.title}
                    </Text>
                    <View style={styles.videoMeta}>
                      <Text style={styles.metaText}>{video.duration_minutes} min</Text>
                      <Text style={styles.metaText}>•</Text>
                      <Text style={styles.priceText}>${video.price.toFixed(2)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  accountButton: {
    padding: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#827546',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInButton: {
    backgroundColor: '#827546',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  continueWatchingSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  continueCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  continueImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
  },
  continueOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  continueTag: {
    backgroundColor: '#827546',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  continueTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  continueInfo: {
    gap: 8,
  },
  continueTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 14,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categorySection: {
    marginTop: 28,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  viewAllText: {
    fontSize: 14,
    color: '#827546',
    fontWeight: '600',
  },
  videoRow: {
    paddingHorizontal: 20,
    gap: 16,
  },
  recommendedCard: {
    width: CARD_WIDTH * 1.8,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  recommendedImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#e5e7eb',
  },
  recommendedContent: {
    padding: 14,
  },
  enrollButton: {
    backgroundColor: '#827546',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  videoCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: CARD_WIDTH * 0.7,
    backgroundColor: '#e5e7eb',
  },
  cardContent: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
    lineHeight: 20,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceText: {
    fontSize: 13,
    color: '#827546',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#827546',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  allVideosHeader: {
    marginTop: 32,
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  allVideosTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  bottomPadding: {
    height: 60,
  },
});
