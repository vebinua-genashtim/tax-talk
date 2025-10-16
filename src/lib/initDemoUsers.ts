import { supabase } from './supabase';

export async function initializeDemoUsers() {
  console.log('Starting demo user initialization...');

  const results = [];

  try {
    const demoUsersSQL = `
      -- Create demo users via admin function
      DO $$
      DECLARE
        free_user_id uuid;
        payper_user_id uuid;
        subscriber_user_id uuid;
        video1_id uuid;
        video2_id uuid;
      BEGIN
        -- Get first two video IDs
        SELECT id INTO video1_id FROM videos ORDER BY created_at LIMIT 1;
        SELECT id INTO video2_id FROM videos ORDER BY created_at LIMIT 1 OFFSET 1;

        -- Note: Users need to be created via Supabase Auth Dashboard or API
        -- This script will create the supporting data once users exist

        RAISE NOTICE 'Demo data setup complete. Create these users in Supabase Auth Dashboard:';
        RAISE NOTICE '1. free@taxtalkpro.com (password: password123)';
        RAISE NOTICE '2. payper@taxtalkpro.com (password: password123)';
        RAISE NOTICE '3. subscriber@taxtalkpro.com (password: password123)';
      END $$;
    `;

    results.push('Checking for existing demo users...');

    const demoEmails = ['free@taxtalkpro.com', 'payper@taxtalkpro.com', 'subscriber@taxtalkpro.com'];
    const passwords = 'password123';

    for (const email of demoEmails) {
      try {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email,
          password: passwords,
        });

        if (loginData?.user) {
          results.push(`✓ ${email} - Already exists and working`);
          await supabase.auth.signOut();
          continue;
        }

        if (loginError) {
          console.log(`${email} needs to be created, attempting signup...`);

          const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: email,
            password: passwords,
            options: {
              data: {
                full_name: email.split('@')[0].replace('payper', 'Pay-Per-View User').replace('subscriber', 'Subscriber').replace('free', 'Free User'),
              },
            },
          });

          if (signupError) {
            results.push(`✗ ${email} - Error: ${signupError.message}`);
            console.error(`Signup error for ${email}:`, signupError);
            continue;
          }

          if (!signupData?.user) {
            results.push(`✗ ${email} - No user data returned`);
            continue;
          }

          results.push(`✓ ${email} - Created successfully`);

          await new Promise(resolve => setTimeout(resolve, 1000));

          const userId = signupData.user.id;
          const userType = email.includes('free') ? 'free' :
                          email.includes('payper') ? 'payper' :
                          'subscriber';

          const { error: profileError } = await supabase.from('profiles').upsert({
            id: userId,
            email: email,
            full_name: userType === 'free' ? 'Free User' :
                      userType === 'payper' ? 'Pay-Per-View User' :
                      'Subscriber',
            subscription_status: 'free',
            is_admin: false,
          });

          if (profileError) {
            console.error('Profile error:', profileError);
          }

          if (userType === 'payper') {
            const { data: videos } = await supabase
              .from('videos')
              .select('id, price')
              .order('created_at')
              .limit(5);

            if (videos && videos.length >= 5) {
              for (const video of videos) {
                await supabase.from('purchases').upsert({
                  user_id: userId,
                  video_id: video.id,
                  amount_paid: video.price,
                });
              }
              results.push(`  → Added 5 video purchases`);
            }
          }

          if (userType === 'subscriber') {
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1);

            await supabase.from('subscriptions').insert({
              user_id: userId,
              end_date: endDate.toISOString(),
              amount_paid: 999,
              status: 'active',
            });

            await supabase.from('profiles').update({
              subscription_status: 'active',
              subscription_end_date: endDate.toISOString(),
            }).eq('id', userId);

            results.push(`  → Activated subscription`);
          }

          await supabase.auth.signOut();
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error: any) {
        console.error(`Error processing ${email}:`, error);
        results.push(`✗ ${email} - Exception: ${error.message}`);
      }
    }

    if (results.every(r => r.includes('✗'))) {
      results.push('');
      results.push('⚠️ Email confirmation may be enabled in Supabase.');
      results.push('Please disable it in: Authentication > Settings > Email Auth');
      results.push('Or manually create users in the Supabase dashboard.');
    }

  } catch (error: any) {
    console.error('Fatal error in initializeDemoUsers:', error);
    results.push(`Fatal error: ${error.message}`);
  }

  console.log('Demo user creation results:', results);
  return results;
}
