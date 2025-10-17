import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Video } from '../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'CategoryList'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function CategoryListScreen({ route, navigation }: Props) {
  const { title, videos } = route.params;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>{title}</Text>
        <Text style={styles.subheader}>
          {videos.length} {videos.length === 1 ? 'video' : 'videos'}
        </Text>

        <View style={styles.grid}>
          {videos.map((video) => (
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
        </View>

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
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  subheader: {
    fontSize: 14,
    color: '#6b7280',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
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
    marginBottom: 8,
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
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#827546',
  },
  bottomPadding: {
    height: 40,
  },
});
