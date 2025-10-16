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

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*, category:categories(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVideos(data || []);
      setError(null);
    } catch (error) {
      console.error('Error loading videos:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to load videos';
      setError(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadVideos();
  };

  const featuredVideos = videos.filter(v => v.is_featured).slice(0, 6);
  const newVideos = videos.filter(v => v.is_new).slice(0, 6);
  const popularVideos = [...videos].sort((a, b) => b.view_count - a.view_count).slice(0, 6);

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
        {user ? (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Account')}
          >
            <Text style={styles.headerButtonText}>Account</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => navigation.navigate('Auth')}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() => navigation.navigate('Subscription')}
            >
              <Text style={styles.subscribeButtonText}>Subscribe</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>


      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {!user && videos.length > 0 && (
          <View style={styles.heroBanner}>
            <Text style={styles.heroTitle}>Welcome to Tax Talk Pro</Text>
            <Text style={styles.heroSubtitle}>
              Access professional tax training videos to enhance your expertise
            </Text>
            <View style={styles.heroButtons}>
              <TouchableOpacity
                style={styles.heroSubscribeButton}
                onPress={() => navigation.navigate('Subscription')}
              >
                <Text style={styles.heroSubscribeButtonText}>View Plans</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heroSignInButton}
                onPress={() => navigation.navigate('Auth')}
              >
                <Text style={styles.heroSignInButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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

        {user && profile?.subscription_status !== 'active' && videos.length > 0 && (
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

        {featuredVideos.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>Featured Training</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.videoRow}
            >
              {featuredVideos.map((video) => (
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

        {newVideos.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>New Releases</Text>
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
    backgroundColor: '#f9fafb',
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  signInButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  subscribeButton: {
    backgroundColor: '#827546',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  heroBanner: {
    backgroundColor: '#033a66',
    margin: 16,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 20,
    lineHeight: 20,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  heroSubscribeButton: {
    flex: 1,
    backgroundColor: '#827546',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  heroSubscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  heroSignInButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  heroSignInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  subscribeBanner: {
    backgroundColor: '#827546',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
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
    marginTop: 32,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    paddingHorizontal: 16,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  videoRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  videoCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: CARD_WIDTH * 0.65,
    backgroundColor: '#e5e7eb',
  },
  cardContent: {
    padding: 14,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 20,
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
  allVideosHeader: {
    marginTop: 40,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  allVideosTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  bottomPadding: {
    height: 40,
  },
});
