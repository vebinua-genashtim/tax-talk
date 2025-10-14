import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration_seconds: number;
  category_id: string;
  price: number;
  is_featured: boolean;
  is_new: boolean;
  view_count: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  display_order: number;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  subscription_status: 'free' | 'active' | 'cancelled';
  subscription_end_date: string | null;
  is_admin: boolean;
  phone_number: string;
  billing_address: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  } | null;
  created_at: string;
  updated_at: string;
}
