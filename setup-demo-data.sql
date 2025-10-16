-- Demo User Setup for Tax Talk Pro
-- This script creates demo users and seeds the database for presentation purposes

-- Note: You'll need to create these users in Supabase Auth first, then run this script
-- The user IDs below are placeholders and should be replaced with actual auth.users IDs

-- Demo Users:
-- 1. demo@taxtalkpro.com (password: demo123) - Active subscriber with full access
-- 2. free@taxtalkpro.com (password: free123) - Free user, no subscription
-- 3. expired@taxtalkpro.com (password: expired123) - Expired subscription

-- After creating users in Supabase Auth Dashboard, update profiles with subscription status:

-- Update demo subscriber (replace USER_ID with actual ID from auth.users)
-- UPDATE profiles
-- SET
--   full_name = 'Demo Subscriber',
--   subscription_status = 'active',
--   subscription_end_date = NOW() + INTERVAL '1 year'
-- WHERE email = 'demo@taxtalkpro.com';

-- Update free user
-- UPDATE profiles
-- SET
--   full_name = 'Free User',
--   subscription_status = 'free',
--   subscription_end_date = NULL
-- WHERE email = 'free@taxtalkpro.com';

-- Update expired user
-- UPDATE profiles
-- SET
--   full_name = 'Expired User',
--   subscription_status = 'expired',
--   subscription_end_date = NOW() - INTERVAL '30 days'
-- WHERE email = 'expired@taxtalkpro.com';

-- You can use existing demo users:
-- Email: subscriber@taxacademy.sg (already has active subscription until 2026)
-- This user can be used for cross-platform testing

SELECT
  email,
  full_name,
  subscription_status,
  subscription_end_date
FROM profiles
ORDER BY subscription_status DESC;
