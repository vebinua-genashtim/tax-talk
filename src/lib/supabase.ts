import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://0ec90b57d6e95fcbda19832f.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  subscription_status: 'free' | 'active' | 'expired';
  subscription_end_date?: string;
  is_admin: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  category_id?: string;
  thumbnail_url: string;
  trailer_url: string;
  full_video_url: string;
  duration_minutes: number;
  price: number;
  is_featured: boolean;
  is_new: boolean;
  view_count: number;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  video_id: string;
  amount_paid: number;
  purchased_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  amount_paid: number;
  status: 'active' | 'expired' | 'cancelled';
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
