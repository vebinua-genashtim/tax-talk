/*
  # Add Watch Progress Tracking

  1. New Tables
    - `watch_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `video_id` (text, references video ID)
      - `progress_seconds` (numeric, seconds watched)
      - `duration_seconds` (numeric, total video duration)
      - `completed` (boolean, whether video is finished)
      - `last_watched_at` (timestamptz, last time user watched)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `watch_progress` table
    - Add policy for users to read their own watch progress
    - Add policy for users to insert their own watch progress
    - Add policy for users to update their own watch progress

  3. Indexes
    - Index on (user_id, video_id) for fast lookups
*/

CREATE TABLE IF NOT EXISTS watch_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id text NOT NULL,
  progress_seconds numeric DEFAULT 0 NOT NULL,
  duration_seconds numeric DEFAULT 0 NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  last_watched_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, video_id)
);

-- Enable RLS
ALTER TABLE watch_progress ENABLE ROW LEVEL SECURITY;

-- Users can read their own watch progress
CREATE POLICY "Users can read own watch progress"
  ON watch_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own watch progress
CREATE POLICY "Users can insert own watch progress"
  ON watch_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own watch progress
CREATE POLICY "Users can update own watch progress"
  ON watch_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS watch_progress_user_video_idx ON watch_progress(user_id, video_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_watch_progress_updated_at ON watch_progress;
CREATE TRIGGER update_watch_progress_updated_at
  BEFORE UPDATE ON watch_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
