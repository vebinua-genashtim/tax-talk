import { Video } from '../data/mockData';

interface WatchHistory {
  video_id: string;
  last_watched_at: string;
  progress_seconds: number;
}

export function generateRecommendations(
  allVideos: Video[],
  watchHistory: WatchHistory[],
  purchases: Set<string>,
  maxRecommendations: number = 6
): Video[] {
  if (watchHistory.length === 0) {
    return allVideos
      .filter(v => v.is_featured || v.is_new)
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, maxRecommendations);
  }

  const watchedVideoIds = new Set(watchHistory.map(wh => wh.video_id));
  const watchedVideos = allVideos.filter(v => watchedVideoIds.has(v.id));

  const categoryScores = new Map<string, number>();
  watchedVideos.forEach(video => {
    if (video.category_id) {
      const current = categoryScores.get(video.category_id) || 0;
      categoryScores.set(video.category_id, current + 1);
    }
  });

  const topCategories = Array.from(categoryScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([categoryId]) => categoryId);

  const recommendations = allVideos
    .filter(video =>
      !watchedVideoIds.has(video.id) &&
      (topCategories.includes(video.category_id || '') || video.is_featured || video.is_new)
    )
    .map(video => {
      let score = 0;

      if (topCategories.includes(video.category_id || '')) {
        score += 10;
      }

      if (video.is_featured) score += 5;
      if (video.is_new) score += 3;

      score += Math.log(video.view_count + 1);

      return { video, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, maxRecommendations)
    .map(({ video }) => video);

  return recommendations;
}
