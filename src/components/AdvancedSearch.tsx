import { useState } from 'react';
import { Search, Filter, X, CheckCircle, Lock } from 'lucide-react';
import { Video, Category } from '../lib/supabase';

interface AdvancedSearchProps {
  videos: Video[];
  categories: Category[];
  hasAccess: (videoId: string) => boolean;
  onSearch: (query: string, filters: SearchFilters) => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface SearchFilters {
  categoryId: string | null;
  accessType: 'all' | 'accessible' | 'locked';
  sortBy: 'relevance' | 'newest' | 'popular' | 'title';
}

export function AdvancedSearch({
  videos,
  categories,
  hasAccess,
  onSearch,
  isOpen,
  onClose
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    categoryId: null,
    accessType: 'all',
    sortBy: 'relevance'
  });

  const handleQueryChange = (value: string) => {
    setQuery(value);
    onSearch(value, filters);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onSearch(query, updatedFilters);
  };

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      categoryId: null,
      accessType: 'all',
      sortBy: 'relevance'
    };
    setFilters(defaultFilters);
    setQuery('');
    onSearch('', defaultFilters);
  };

  const activeFilterCount =
    (filters.categoryId ? 1 : 0) +
    (filters.accessType !== 'all' ? 1 : 0) +
    (filters.sortBy !== 'relevance' ? 1 : 0);

  if (!isOpen) return null;

  return (
    <div className="px-4 sm:px-6 md:px-8 py-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border-b border-white/20">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search videos by title, description, or topic..."
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
              autoFocus
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl transition-colors"
          >
            <Filter className="w-5 h-5 text-white" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {showFilters && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 space-y-4">
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleFilterChange({ categoryId: null })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.categoryId === null
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleFilterChange({ categoryId: category.id })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.categoryId === category.id
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Access Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange({ accessType: 'all' })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.accessType === 'all'
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  All Videos
                </button>
                <button
                  onClick={() => handleFilterChange({ accessType: 'accessible' })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.accessType === 'accessible'
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  My Access
                </button>
                <button
                  onClick={() => handleFilterChange({ accessType: 'locked' })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.accessType === 'locked'
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Locked
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Sort By
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange({ sortBy: 'relevance' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.sortBy === 'relevance'
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  Relevance
                </button>
                <button
                  onClick={() => handleFilterChange({ sortBy: 'newest' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.sortBy === 'newest'
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => handleFilterChange({ sortBy: 'popular' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.sortBy === 'popular'
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  Popular
                </button>
                <button
                  onClick={() => handleFilterChange({ sortBy: 'title' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.sortBy === 'title'
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  A-Z
                </button>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 rounded-lg text-sm font-medium transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
