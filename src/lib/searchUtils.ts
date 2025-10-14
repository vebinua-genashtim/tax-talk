import { Video } from './supabase';
import { SearchFilters } from '../components/AdvancedSearch';

export function filterAndSortVideos(
  videos: Video[],
  query: string,
  filters: SearchFilters,
  hasAccess: (videoId: string) => boolean
): Video[] {
  let filtered = [...videos];

  if (query.trim()) {
    const searchTerm = query.toLowerCase().trim();
    filtered = filtered.filter(video =>
      video.title.toLowerCase().includes(searchTerm) ||
      video.description.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.categoryId) {
    filtered = filtered.filter(video => video.category_id === filters.categoryId);
  }

  if (filters.accessType === 'accessible') {
    filtered = filtered.filter(video => hasAccess(video.id));
  } else if (filters.accessType === 'locked') {
    filtered = filtered.filter(video => !hasAccess(video.id));
  }

  switch (filters.sortBy) {
    case 'newest':
      filtered.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
      break;

    case 'popular':
      filtered.sort((a, b) => b.view_count - a.view_count);
      break;

    case 'title':
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;

    case 'relevance':
    default:
      if (query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        filtered.sort((a, b) => {
          const aTitle = a.title.toLowerCase();
          const bTitle = b.title.toLowerCase();

          const aExactMatch = aTitle === searchTerm;
          const bExactMatch = bTitle === searchTerm;
          if (aExactMatch && !bExactMatch) return -1;
          if (!aExactMatch && bExactMatch) return 1;

          const aStartsWith = aTitle.startsWith(searchTerm);
          const bStartsWith = bTitle.startsWith(searchTerm);
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;

          const aIncludes = aTitle.includes(searchTerm);
          const bIncludes = bTitle.includes(searchTerm);
          if (aIncludes && !bIncludes) return -1;
          if (!aIncludes && bIncludes) return 1;

          return b.view_count - a.view_count;
        });
      } else {
        filtered.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          if (a.is_new && !b.is_new) return -1;
          if (!a.is_new && b.is_new) return 1;
          return b.view_count - a.view_count;
        });
      }
      break;
  }

  return filtered;
}

export function getSearchResultsSummary(
  totalResults: number,
  query: string,
  filters: SearchFilters,
  categories: Array<{ id: string; name: string }>
): string {
  const parts: string[] = [];

  if (totalResults === 0) {
    return 'No results found';
  }

  parts.push(`${totalResults} video${totalResults !== 1 ? 's' : ''}`);

  if (query.trim()) {
    parts.push(`matching "${query}"`);
  }

  if (filters.categoryId) {
    const category = categories.find(c => c.id === filters.categoryId);
    if (category) {
      parts.push(`in ${category.name}`);
    }
  }

  if (filters.accessType === 'accessible') {
    parts.push('(accessible to you)');
  } else if (filters.accessType === 'locked') {
    parts.push('(locked)');
  }

  return parts.join(' ');
}
