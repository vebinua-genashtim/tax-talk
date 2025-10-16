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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase, Video } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;

export default function HomeScreen({ navigation }: Props) {
  const { user, profile } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setDebugInfo('Starting to load videos...');
      console.log('Loading videos...');

      const { data, error } = await supabase
        .from('videos')
        .select('*, category:categories(name)')
        .order('created_at', { ascending: false });

      setDebugInfo(`Response received. Data: ${data?.length || 0} videos, Error: ${error?.message || 'none'}`);
      console.log('Videos response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        setError(error.message);
        setDebugInfo(`Error: ${error.message}`);
        throw error;
      }

      console.log('Videos loaded:', data?.length);
      setVideos(data || []);
      setError(null);
      setDebugInfo(`Success! Loaded ${data?.length || 0} videos`);
    } catch (error) {
      console.error('Error loading videos:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to load videos';
      setError(errorMsg);
      setDebugInfo(`Catch block: ${errorMsg}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadVideos();
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
        <Text style={styles.logo}>Tax Talk Pro</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => user ? navigation.navigate('Account') : navigation.navigate('Auth')}
        >
          <Text style={styles.headerButtonText}>
            {user ? 'Account' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 16, backgroundColor: '#ffe6e6' }}>
        <Text style={{ fontSize: 12, color: '#cc0000' }}>Debug: {debugInfo}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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

        {profile?.subscription_status !== 'active' && videos.length > 0 && (
          <TouchableOpacity
            style={styles.subscribeBanner}
            onPress={() => navigation.navigate('Subscription')}
          >
            <Text style={styles.bannerTitle}>Unlock All Videos</Text>
            <Text style={styles.bannerSubtitle}>
              Subscribe for unlimited access to all training content
            </Text>
            <View style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>View Plans</Text>
            </View>
          </TouchableOpacity>
        )}

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#033a66',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButton: {
    backgroundColor: '#827546',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  subscribeBanner: {
    backgroundColor: '#827546',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 16,
  },
  bannerButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#827546',
    fontSize: 14,
    fontWeight: '600',
  },
  categorySection: {
    marginTop: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#033a66',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  videoRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  videoCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: CARD_WIDTH * 0.6,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceText: {
    fontSize: 12,
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
});
