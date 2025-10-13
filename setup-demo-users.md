# Demo Users Setup Instructions

The platform has three demo accounts pre-configured. Follow these steps to set them up.

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
- **Email:** `free@taxacademy.sg`
- **Password:** `demo123456`
- **Auto Confirm User:** ✓ (checked)
- Click **Create user**

#### User 2: Pay-Per-View
- **Email:** `payper@taxacademy.sg`
- **Password:** `demo123456`
- **Auto Confirm User:** ✓ (checked)
- Click **Create user**

#### User 3: Subscriber
- **Email:** `subscriber@taxacademy.sg`
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
WHERE email IN ('free@taxacademy.sg', 'payper@taxacademy.sg', 'subscriber@taxacademy.sg');

-- Create profiles for all users
INSERT INTO profiles (id, email, full_name, subscription_status, is_admin)
SELECT
  id,
  email,
  CASE
    WHEN email = 'free@taxacademy.sg' THEN 'Free User'
    WHEN email = 'payper@taxacademy.sg' THEN 'Pay-Per-View User'
    WHEN email = 'subscriber@taxacademy.sg' THEN 'Subscriber'
  END as full_name,
  'free' as subscription_status,
  false as is_admin
FROM auth.users
WHERE email IN ('free@taxacademy.sg', 'payper@taxacademy.sg', 'subscriber@taxacademy.sg')
ON CONFLICT (id) DO NOTHING;

-- Add purchases for pay-per-view user
WITH payper_user AS (
  SELECT id FROM auth.users WHERE email = 'payper@taxacademy.sg'
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
  SELECT id FROM auth.users WHERE email = 'subscriber@taxacademy.sg'
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
  SELECT id FROM auth.users WHERE email = 'subscriber@taxacademy.sg'
);
```

## Demo Account Credentials

All three accounts use the same password: **demo123456**

- **Free User:** free@taxacademy.sg
  - Access: Trailers only

- **Pay-Per-View User:** payper@taxacademy.sg
  - Access: 2 purchased videos + trailers for others

- **Subscriber:** subscriber@taxacademy.sg
  - Access: All videos (unlimited)

## Testing Each User Type

### Free User (free@taxacademy.sg)
- Can only watch trailers/previews
- Sees "Purchase Now" button on all videos
- Cannot access full video content

### Pay-Per-View User (payper@taxacademy.sg)
- Can watch full versions of the 2 purchased videos
- Sees trailers for unpurchased videos
- Can purchase additional videos

### Subscriber (subscriber@taxacademy.sg)
- Has unlimited access to all videos
- Can watch any video in full
- No purchase buttons shown
- Green "Active Subscription" badge displayed
