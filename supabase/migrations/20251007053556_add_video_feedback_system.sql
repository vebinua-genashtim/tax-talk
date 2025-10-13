/*
  # Add Video Feedback System

  1. New Tables
    - `video_feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `video_id` (uuid, foreign key to videos)
      - `feedback_type` (text: 'not_for_me', 'like', 'love')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - Unique constraint on (user_id, video_id)
  
  2. Security
    - Enable RLS on `video_feedback` table
    - Users can view their own feedback
    - Users can insert/update/delete their own feedback
  
  3. Indexes
    - Index on user_id for fast lookup
    - Index on video_id for analytics
*/

-- Create video_feedback table
CREATE TABLE IF NOT EXISTS video_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  feedback_type text NOT NULL CHECK (feedback_type IN ('not_for_me', 'like', 'love')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_video_feedback UNIQUE (user_id, video_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_video_feedback_user_id ON video_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_video_feedback_video_id ON video_feedback(video_id);

-- Enable RLS
ALTER TABLE video_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own feedback"
  ON video_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
  ON video_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON video_feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
  ON video_feedback
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_video_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_video_feedback_timestamp ON video_feedback;
CREATE TRIGGER update_video_feedback_timestamp
  BEFORE UPDATE ON video_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_video_feedback_updated_at();
