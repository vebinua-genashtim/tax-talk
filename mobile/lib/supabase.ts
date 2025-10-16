import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aexpvbtgtzfwsysxzwew.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFleHB2YnRndHpmd3N5c3h6d2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MTc0NjUsImV4cCI6MjA3NTk5MzQ2NX0.aUmBkcuMt7GpGLllKGZhdmmcaW9E30uKQPJez0-AU3o';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  trailer_url: string;
  full_video_url: string;
  duration_minutes: number;
  price: number;
  category_id?: string;
  category?: {
    name: string;
  };
  is_featured: boolean;
  is_new: boolean;
  view_count: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  subscription_status: 'free' | 'active' | 'expired';
  subscription_end_date?: string;
  is_admin: boolean;
  created_at?: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  video_id: string;
  amount_paid: number;
  purchased_at: string;
}

export interface WatchProgress {
  id: string;
  user_id: string;
  video_id: string;
  progress_seconds: number;
  duration_seconds: number;
  completed: boolean;
  last_watched_at: string;
  created_at: string;
  updated_at: string;
}
