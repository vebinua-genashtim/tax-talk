import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aexpvbtgtzfwsysxzwew.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFleHB2YnRndHpmd3N5c3h6d2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MTc0NjUsImV4cCI6MjA3NTk5MzQ2NX0.aUmBkcuMt7GpGLllKGZhdmmcaW9E30uKQPJez0-AU3o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
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
  category_id: string;
  category?: {
    name: string;
  };
  view_count: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  subscription_status: 'free' | 'active' | 'cancelled';
  subscription_plan: string | null;
  subscription_end_date: string | null;
  created_at: string;
}
