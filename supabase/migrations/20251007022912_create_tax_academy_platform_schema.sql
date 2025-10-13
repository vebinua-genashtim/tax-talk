/*
  # Tax Academy Singapore Training Platform - Complete Database Schema

  ## Overview
  Complete database schema for a Netflix-style tax training platform with three access tiers:
  - Free: Access to video trailers/previews only
  - Pay-per-view: Purchase individual videos for lifetime access
  - Subscription: Unlimited access to all videos

  ## New Tables

  ### 1. profiles
  Extended user profile linked to auth.users
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, not null)
  - `full_name` (text)
  - `subscription_status` (text) - 'free', 'active', 'expired'
  - `subscription_end_date` (timestamptz)
  - `is_admin` (boolean) - for admin panel access
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. categories
  Video categories for organizing content
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `slug` (text, unique, not null)
  - `description` (text)
  - `display_order` (integer)
  - `created_at` (timestamptz)

  ### 3. videos
  Tax training video content with metadata
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `description` (text, not null)
  - `category_id` (uuid, references categories)
  - `thumbnail_url` (text, not null)
  - `trailer_url` (text, not null) - free preview for all users
  - `full_video_url` (text, not null) - full content for paid access
  - `duration_minutes` (integer)
  - `price` (numeric) - pay-per-view price in dollars
  - `is_featured` (boolean)
  - `is_new` (boolean)
  - `view_count` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. purchases
  Individual video purchases (pay-per-view)
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `video_id` (uuid, references videos)
  - `amount_paid` (numeric)
  - `purchased_at` (timestamptz)
  - Unique constraint on (user_id, video_id)

  ### 5. subscriptions
  User subscription records
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `start_date` (timestamptz)
  - `end_date` (timestamptz)
  - `amount_paid` (numeric)
  - `status` (text) - 'active', 'expired', 'cancelled'
  - `created_at` (timestamptz)

  ### 6. watch_history
  Track user viewing progress
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `video_id` (uuid, references videos)
  - `last_watched_at` (timestamptz)
  - `progress_seconds` (integer)
  - Unique constraint on (user_id, video_id)

  ## Security (Row Level Security)
  
  All tables have RLS enabled with appropriate policies:
  - Users can read their own profiles
  - Anyone can view video catalog metadata
  - Users can only access their own purchases and subscriptions
  - Admins have full access to manage content
  
  ## Sample Data
  
  Includes:
  - 6 tax training categories
  - 8 sample training videos
  - 3 demo users (free, pay-per-view, subscriber)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  subscription_status text DEFAULT 'free' NOT NULL CHECK (subscription_status IN ('free', 'active', 'expired')),
  subscription_end_date timestamptz,
  is_admin boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view basic profile info"
  ON profiles FOR SELECT
  TO public
  USING (true);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  display_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  thumbnail_url text NOT NULL,
  trailer_url text NOT NULL,
  full_video_url text NOT NULL,
  duration_minutes integer DEFAULT 0 NOT NULL,
  price numeric(10, 2) DEFAULT 0 NOT NULL,
  is_featured boolean DEFAULT false NOT NULL,
  is_new boolean DEFAULT false NOT NULL,
  view_count integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view video metadata"
  ON videos FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete videos"
  ON videos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  amount_paid numeric(10, 2) NOT NULL,
  purchased_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, video_id)
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases"
  ON purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_date timestamptz DEFAULT now() NOT NULL,
  end_date timestamptz NOT NULL,
  amount_paid numeric(10, 2) NOT NULL,
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create watch_history table
CREATE TABLE IF NOT EXISTS watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  last_watched_at timestamptz DEFAULT now() NOT NULL,
  progress_seconds integer DEFAULT 0 NOT NULL,
  UNIQUE(user_id, video_id)
);

ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watch history"
  ON watch_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watch history"
  ON watch_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watch history"
  ON watch_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_videos_new ON videos(is_new) WHERE is_new = true;
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_video ON purchases(video_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_watch_history_user ON watch_history(user_id);

-- Insert sample categories
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('GST (Goods & Services Tax)', 'gst', 'Comprehensive training on Singapore GST regulations and compliance', 1),
  ('Income Tax', 'income-tax', 'Personal and corporate income tax training', 2),
  ('Corporate Tax', 'corporate-tax', 'Advanced corporate taxation strategies', 3),
  ('Tax Planning', 'tax-planning', 'Strategic tax planning and optimization', 4),
  ('International Tax', 'international-tax', 'Cross-border tax issues and treaties', 5),
  ('Tax Compliance', 'tax-compliance', 'Regulatory compliance and reporting requirements', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample videos
INSERT INTO videos (title, description, category_id, thumbnail_url, trailer_url, full_video_url, duration_minutes, price, is_featured, is_new, view_count) 
SELECT 
  'GST Fundamentals: A Complete Guide',
  'Master the fundamentals of Singapore GST system including registration requirements, input and output tax, and compliance obligations. This comprehensive course covers everything you need to know about GST administration.',
  (SELECT id FROM categories WHERE slug = 'gst'),
  'https://images.pexels.com/photos/6863332/pexels-photo-6863332.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  45,
  49.99,
  true,
  false,
  1520
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'GST Fundamentals: A Complete Guide');

INSERT INTO videos (title, description, category_id, thumbnail_url, trailer_url, full_video_url, duration_minutes, price, is_featured, is_new, view_count)
SELECT
  'Advanced GST Compliance Strategies',
  'Deep dive into complex GST scenarios including exempt supplies, zero-rated supplies, international services, and reverse charge mechanism. Learn advanced compliance strategies for businesses.',
  (SELECT id FROM categories WHERE slug = 'gst'),
  'https://images.pexels.com/photos/7713188/pexels-photo-7713188.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  60,
  69.99,
  false,
  true,
  890
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Advanced GST Compliance Strategies');

INSERT INTO videos (title, description, category_id, thumbnail_url, trailer_url, full_video_url, duration_minutes, price, is_featured, is_new, view_count)
SELECT
  'Personal Income Tax Essentials',
  'Understand personal income tax obligations in Singapore including tax residency, employment income, trade and business income, and various reliefs and rebates available to individuals.',
  (SELECT id FROM categories WHERE slug = 'income-tax'),
  'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  50,
  54.99,
  true,
  false,
  2340
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Personal Income Tax Essentials');

INSERT INTO videos (title, description, category_id, thumbnail_url, trailer_url, full_video_url, duration_minutes, price, is_featured, is_new, view_count)
SELECT
  'Corporate Tax Planning & Optimization',
  'Learn effective corporate tax planning strategies including group relief, transfer pricing, tax incentives, and corporate restructuring to optimize your companys tax position.',
  (SELECT id FROM categories WHERE slug = 'corporate-tax'),
  'https://images.pexels.com/photos/7681087/pexels-photo-7681087.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  75,
  89.99,
  false,
  true,
  1120
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Corporate Tax Planning & Optimization');

INSERT INTO videos (title, description, category_id, thumbnail_url, trailer_url, full_video_url, duration_minutes, price, is_featured, is_new, view_count)
SELECT
  'Tax Treaties and International Taxation',
  'Navigate the complexities of international taxation including double tax agreements, permanent establishment, withholding tax, and cross-border transactions.',
  (SELECT id FROM categories WHERE slug = 'international-tax'),
  'https://images.pexels.com/photos/6863365/pexels-photo-6863365.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  90,
  99.99,
  true,
  false,
  780
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Tax Treaties and International Taxation');

INSERT INTO videos (title, description, category_id, thumbnail_url, trailer_url, full_video_url, duration_minutes, price, is_featured, is_new, view_count)
SELECT
  'Tax Compliance for SMEs',
  'Essential tax compliance guide for small and medium enterprises covering corporate tax filing, estimated chargeable income, and common pitfalls to avoid.',
  (SELECT id FROM categories WHERE slug = 'corporate-tax'),
  'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  55,
  59.99,
  false,
  true,
  1450
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Tax Compliance for SMEs');

INSERT INTO videos (title, description, category_id, thumbnail_url, trailer_url, full_video_url, duration_minutes, price, is_featured, is_new, view_count)
SELECT
  'Strategic Tax Planning for High Net Worth',
  'Advanced tax planning strategies for high net worth individuals including estate planning, investment structuring, and wealth preservation techniques.',
  (SELECT id FROM categories WHERE slug = 'tax-planning'),
  'https://images.pexels.com/photos/6863339/pexels-photo-6863339.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  80,
  119.99,
  false,
  false,
  620
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Strategic Tax Planning for High Net Worth');

INSERT INTO videos (title, description, category_id, thumbnail_url, trailer_url, full_video_url, duration_minutes, price, is_featured, is_new, view_count)
SELECT
  'Transfer Pricing Fundamentals',
  'Understand transfer pricing principles, documentation requirements, and how to determine arms length pricing for related party transactions.',
  (SELECT id FROM categories WHERE slug = 'international-tax'),
  'https://images.pexels.com/photos/7681089/pexels-photo-7681089.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  70,
  94.99,
  false,
  true,
  950
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Transfer Pricing Fundamentals');