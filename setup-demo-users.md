# Demo Users Setup Instructions for Tax Talk Pro

The platform has demo accounts that work across BOTH web and mobile apps. These accounts share the same database, so logging in with the same credentials on web or mobile gives you the same experience.

## Quick Setup (Recommended)

1. **Open the application** and click "Sign In"
2. **Click "Create Demo Users"** button (golden/brown button)
3. **Check the results** - if email confirmation is enabled in Supabase, you'll need to use Method 2

## Method 1: Automatic via App (If Email Confirmation Disabled)

If email confirmation is **disabled** in your Supabase project:

1. Click "Sign In" button
2. Click "Create Demo Users"
3. Wait for confirmation message
4. Click any demo account button to sign in

## Method 2: Manual Creation (If Email Confirmation Enabled)

If you see "Invalid login credentials" error, email confirmation is likely enabled. Follow these steps:

### Step 1: Disable Email Confirmation in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** > **Settings**
4. Find **Email Auth** section
5. **Disable "Enable email confirmations"**
6. Click **Save**

### Step 2: Create Demo Users via Supabase Dashboard

1. In Supabase Dashboard, go to **Authentication** > **Users**
2. Click **"Add user"** > **"Create new user"**
3. Create each user with these details:

#### User 1: Free Tier
- **Email:** `free@taxtalkpro.com`
- **Password:** `demo123456`
- **Auto Confirm User:** ✓ (checked)
- Click **Create user**

#### User 2: Pay-Per-View
- **Email:** `payper@taxtalkpro.com`
- **Password:** `demo123456`
- **Auto Confirm User:** ✓ (checked)
- Click **Create user**

#### User 3: Subscriber (RECOMMENDED FOR DEMOS)
- **Email:** `subscriber@taxtalkpro.com`
- **Password:** `demo123456`
- **Auto Confirm User:** ✓ (checked)
- Click **Create user**

### Step 3: Set Up User Data

After creating the users in Supabase Dashboard:

1. Go to **SQL Editor** in Supabase
2. Run this SQL to set up purchases and subscriptions:

```sql
-- First, get the user IDs
SELECT id, email FROM auth.users
WHERE email IN ('free@taxtalkpro.com', 'payper@taxtalkpro.com', 'subscriber@taxtalkpro.com');

-- Create profiles for all users
INSERT INTO profiles (id, email, full_name, subscription_status, is_admin)
SELECT
  id,
  email,
  CASE
    WHEN email = 'free@taxtalkpro.com' THEN 'Free User'
    WHEN email = 'payper@taxtalkpro.com' THEN 'Pay-Per-View User'
    WHEN email = 'subscriber@taxtalkpro.com' THEN 'Subscriber'
  END as full_name,
  'free' as subscription_status,
  false as is_admin
FROM auth.users
WHERE email IN ('free@taxtalkpro.com', 'payper@taxtalkpro.com', 'subscriber@taxtalkpro.com')
ON CONFLICT (id) DO NOTHING;

-- Add purchases for pay-per-view user
WITH payper_user AS (
  SELECT id FROM auth.users WHERE email = 'payper@taxtalkpro.com'
),
first_videos AS (
  SELECT id, price FROM videos ORDER BY created_at LIMIT 2
)
INSERT INTO purchases (user_id, video_id, amount_paid)
SELECT payper_user.id, first_videos.id, first_videos.price
FROM payper_user, first_videos
ON CONFLICT (user_id, video_id) DO NOTHING;

-- Add subscription for subscriber user
WITH subscriber_user AS (
  SELECT id FROM auth.users WHERE email = 'subscriber@taxtalkpro.com'
)
INSERT INTO subscriptions (user_id, end_date, amount_paid, status)
SELECT
  id,
  NOW() + INTERVAL '1 year',
  999.00,
  'active'
FROM subscriber_user
ON CONFLICT DO NOTHING;

-- Update subscriber profile
UPDATE profiles
SET
  subscription_status = 'active',
  subscription_end_date = NOW() + INTERVAL '1 year'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'subscriber@taxtalkpro.com'
);
```

## Demo Account Credentials

All three accounts use the same password: **demo123456**

These credentials work on BOTH web and mobile apps:

- **Free User:** free@taxtalkpro.com
  - Access: Trailers only
  - Works on: Web & Mobile

- **Pay-Per-View User:** payper@taxtalkpro.com
  - Access: 2 purchased videos + trailers for others
  - Works on: Web & Mobile

- **Subscriber (BEST FOR DEMOS):** subscriber@taxtalkpro.com
  - Access: All videos (unlimited)
  - Works on: Web & Mobile
  - Recommended for presentations

## Testing Each User Type

### Free User (free@taxtalkpro.com)
- Can only watch trailers/previews
- Sees "Purchase Now" button on all videos
- Cannot access full video content
- Same experience on web and mobile

### Pay-Per-View User (payper@taxtalkpro.com)
- Can watch full versions of the 2 purchased videos
- Sees trailers for unpurchased videos
- Can purchase additional videos
- Same experience on web and mobile

### Subscriber (subscriber@taxtalkpro.com) ⭐ RECOMMENDED
- Has unlimited access to all videos
- Can watch any video in full
- No purchase buttons shown
- Green "Active Subscription" badge displayed
- Same experience on web and mobile
- Perfect for presentations

## Cross-Platform Testing

To verify that accounts work across platforms:

1. **Login on Web:** Use subscriber@taxtalkpro.com / demo123456
2. **Start watching a video** and note your progress
3. **Login on Mobile:** Use the SAME credentials
4. **Check your account** - subscription status should match
5. **View the same video** - you should see your watch history

Both platforms now share:
- User accounts
- Subscription status
- Watch history
- Purchases
- All user data
