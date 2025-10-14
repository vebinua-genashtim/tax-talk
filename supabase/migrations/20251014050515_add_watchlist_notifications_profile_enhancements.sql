/*
  # Dashboard Enhancement Features Migration
  
  ## Overview
  Adds missing features for comprehensive user dashboard including watchlist, notifications, 
  enhanced profile management, and subscription tracking improvements.
  
  ## New Tables
  
  ### 1. watchlist
  Bookmark/save videos for later viewing
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `video_id` (uuid, references videos)
  - `added_at` (timestamptz)
  - Unique constraint on (user_id, video_id)
  
  ### 2. notifications
  User notifications for content updates, subscription reminders, etc.
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `type` (text) - 'content_update', 'subscription_expiring', 'payment_reminder', 'new_video'
  - `title` (text)
  - `message` (text)
  - `is_read` (boolean)
  - `related_video_id` (uuid, optional reference to videos)
  - `created_at` (timestamptz)
  
  ## Table Modifications
  
  ### profiles table enhancements
  - Add `phone_number` field for contact info
  - Add `billing_address` field for payment info
  - Add `preferences` jsonb field for user settings
  
  ### subscriptions table enhancements
  - Add `plan_type` field ('monthly', 'annual')
  - Add `auto_renew` field (boolean)
  - Add `next_billing_date` field
  - Add `payment_method` field
  
  ## Security
  All tables have RLS enabled with restrictive policies:
  - Users can only access their own watchlist and notifications
  - Authenticated users can add/remove from watchlist
  - System can create notifications for users
  - Users can mark notifications as read
  
  ## Indexes
  Added for optimal query performance on user-specific data
*/

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  added_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, video_id)
);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist"
  ON watchlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own watchlist"
  ON watchlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own watchlist"
  ON watchlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('content_update', 'subscription_expiring', 'payment_reminder', 'new_video')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false NOT NULL,
  related_video_id uuid REFERENCES videos(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enhance profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'billing_address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN billing_address jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferences'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferences jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Enhance subscriptions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'plan_type'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN plan_type text CHECK (plan_type IN ('monthly', 'annual'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'auto_renew'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN auto_renew boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'next_billing_date'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN next_billing_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN payment_method text;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_video ON watchlist(video_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date) WHERE status = 'active';