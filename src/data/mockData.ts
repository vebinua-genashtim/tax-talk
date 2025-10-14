import { Video, Category } from '../lib/supabase';

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Income Tax',
    description: 'Personal and corporate income tax',
    display_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'GST',
    description: 'Goods and Services Tax',
    display_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Tax Planning',
    description: 'Strategic tax planning',
    display_order: 3,
    created_at: new Date().toISOString()
  }
];

export const mockVideos: Video[] = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  title: `Tax Video ${i + 1}`,
  description: `Comprehensive guide to tax topic ${i + 1}`,
  thumbnail_url: `https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg?auto=compress&cs=tinysrgb&w=600`,
  video_url: `https://example.com/video${i + 1}.mp4`,
  duration_seconds: 1800 + i * 100,
  category_id: mockCategories[i % 3].id,
  price: 29.99,
  is_featured: i < 5,
  is_new: i < 3,
  view_count: Math.floor(Math.random() * 10000),
  created_at: new Date(Date.now() - i * 86400000).toISOString()
}));
