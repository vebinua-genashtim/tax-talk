import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import VideoPlayer from '../components/VideoPlayer';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoDetail'>;

export default function VideoDetailScreen({ route, navigation }: Props) {
  const { video } = route.params;
  const { user, profile } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (user && profile) {
      checkAccess();
    }
  }, [user, profile]);

  const checkAccess = async () => {
    if (!user) return;

    if (profile?.subscription_status === 'active') {
      setHasAccess(true);
      return;
    }

    try {
      const { data } = await supabase
        .from('video_purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('video_id', video.id)
        .maybeSingle();

      setHasAccess(!!data);
    } catch (error) {
      console.error('Error checking access:', error);
    }
  };

  const handlePurchase = () => {
    if (!user) {
      navigation.navigate('Auth');
      return;
    }

    Alert.alert(
      'Purchase Video',
      `Purchase "${video.title}" for $${video.price.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('video_purchases')
                .insert({
                  user_id: user.id,
                  video_id: video.id,
                  purchase_price: video.price,
                });

              if (error) throw error;

              Alert.alert('Success', 'Video purchased successfully!');
              setHasAccess(true);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to purchase video');
            }
          },
        },
      ]
    );
  };

  const isSubscriber = profile?.subscription_status === 'active';
  const canWatchFull = hasAccess || isSubscriber;
  const videoUrl = canWatchFull ? video.full_video_url : video.trailer_url;

  return (
    <ScrollView style={styles.container}>
      <VideoPlayer
        videoUrl={videoUrl}
        posterUrl={video.thumbnail_url}
        videoId={video.id}
      />

      <View style={styles.content}>
        <Text style={styles.title}>{video.title}</Text>

        <View style={styles.metadata}>
          <Text style={styles.metaText}>{video.duration_minutes} min</Text>
          <Text style={styles.metaText}>•</Text>
          <Text style={styles.metaText}>{video.view_count} views</Text>
          <Text style={styles.metaText}>•</Text>
          <Text style={styles.priceText}>${video.price.toFixed(2)}</Text>
        </View>

        {!user && (
          <View style={[styles.accessBanner, styles.freeBanner]}>
            <Text style={styles.bannerTitle}>Preview Mode</Text>
            <Text style={styles.bannerText}>
              Sign in to purchase this video for ${video.price.toFixed(2)} or subscribe for unlimited access.
            </Text>
          </View>
        )}

        {user && !canWatchFull && (
          <View style={[styles.accessBanner, styles.payPerViewBanner]}>
            <Text style={styles.bannerTitle}>Purchase to Watch Full Video</Text>
            <Text style={styles.bannerText}>
              Get lifetime access for ${video.price.toFixed(2)} or subscribe for unlimited access.
            </Text>
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={handlePurchase}
            >
              <Text style={styles.purchaseButtonText}>Buy Access</Text>
            </TouchableOpacity>
          </View>
        )}

        {hasAccess && !isSubscriber && (
          <View style={[styles.accessBanner, styles.purchasedBanner]}>
            <Text style={styles.bannerTitle}>✓ Full Access - Purchased</Text>
            <Text style={styles.bannerText}>
              You have lifetime access to this training
            </Text>
          </View>
        )}

        {isSubscriber && (
          <View style={[styles.accessBanner, styles.subscriberBanner]}>
            <Text style={styles.bannerTitle}>✓ Full Access - Subscriber</Text>
            <Text style={styles.bannerText}>
              Unlimited access to all training videos
            </Text>
          </View>
        )}

        <Text style={styles.description}>{video.description}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#033a66',
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceText: {
    fontSize: 14,
    color: '#827546',
    fontWeight: '600',
  },
  accessBanner: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  freeBanner: {
    backgroundColor: '#eff6ff',
    borderLeftColor: '#2563eb',
  },
  payPerViewBanner: {
    backgroundColor: '#fffbeb',
    borderLeftColor: '#827546',
  },
  purchasedBanner: {
    backgroundColor: '#eff6ff',
    borderLeftColor: '#2563eb',
  },
  subscriberBanner: {
    backgroundColor: '#f0fdf4',
    borderLeftColor: '#059669',
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  purchaseButton: {
    backgroundColor: '#827546',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});