import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VideoRow } from './components/VideoRow';
import { VideoCard } from './components/VideoCard';
import { MobileVideoCard } from './components/MobileVideoCard';
import { ContinueWatchingRow } from './components/ContinueWatchingRow';
import { LearningStats } from './components/LearningStats';
import { AuthModal } from './components/AuthModal';
import { VideoModal } from './components/VideoModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { PaymentModal } from './components/PaymentModal';
import { AccountManagement } from './components/AccountManagement';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Video, Category, supabase } from './lib/supabase';
import { mockVideos, mockCategories } from './data/mockData';

function AppContent() {
  const { user, profile } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [purchases, setPurchases] = useState<Set<string>>(new Set());
  const [watchProgress, setWatchProgress] = useState<Map<string, { progress_seconds: number; duration_seconds: number; completed: boolean }>>(new Map());
  const [learningStats, setLearningStats] = useState({
    weeklyMinutes: 0,
    weeklyChange: 0,
    completedVideos: 0,
    weeklyCompleted: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [redirectToSubscription, setRedirectToSubscription] = useState(false);

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    setCategories(mockCategories);
    setVideos(mockVideos);
    setFilteredVideos(mockVideos);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      loadUserPurchases();
      loadWatchProgress();
      loadLearningStats();
    } else {
      setPurchases(new Set());
      setWatchProgress(new Map());
      setLearningStats({
        weeklyMinutes: 0,
        weeklyChange: 0,
        completedVideos: 0,
        weeklyCompleted: 0
      });
    }
  }, [user]);

  const loadUserPurchases = async () => {
    if (!user) return;

    try {
      // Demo pay-per-view user with mock purchases
      if (user.email === 'payper@taxacademy.sg') {
        const demoPurchases = new Set(['1', '3', '5', '7', '9']);
        console.log('Loading demo purchases for pay-per-view user:', Array.from(demoPurchases));
        setPurchases(demoPurchases);
        return;
      }

      const { data, error } = await supabase
        .from('purchases')
        .select('video_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const purchasedVideoIds = new Set(data?.map(p => p.video_id) || []);
      console.log('Loaded purchases from database:', Array.from(purchasedVideoIds));
      setPurchases(purchasedVideoIds);
    } catch (error) {
      console.error('Error loading purchases:', error);
    }
  };

  const loadWatchProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('watch_progress')
        .select('video_id, progress_seconds, duration_seconds, completed')
        .eq('user_id', user.id);

      if (error) throw error;

      const progressMap = new Map(
        data?.map(p => [
          p.video_id,
          {
            progress_seconds: p.progress_seconds,
            duration_seconds: p.duration_seconds,
            completed: p.completed
          }
        ]) || []
      );
      setWatchProgress(progressMap);
    } catch (error) {
      console.error('Error loading watch progress:', error);
    }
  };

  const loadLearningStats = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Get this week's watch progress
      const { data: thisWeekData, error: thisWeekError } = await supabase
        .from('watch_progress')
        .select('progress_seconds, completed, last_watched_at')
        .eq('user_id', user.id)
        .gte('last_watched_at', oneWeekAgo.toISOString());

      if (thisWeekError) throw thisWeekError;

      // Get last week's watch progress for comparison
      const { data: lastWeekData, error: lastWeekError } = await supabase
        .from('watch_progress')
        .select('progress_seconds, last_watched_at')
        .eq('user_id', user.id)
        .gte('last_watched_at', twoWeeksAgo.toISOString())
        .lt('last_watched_at', oneWeekAgo.toISOString());

      if (lastWeekError) throw lastWeekError;

      // Get total completed videos
      const { data: completedData, error: completedError } = await supabase
        .from('watch_progress')
        .select('video_id, completed')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (completedError) throw completedError;

      // Calculate stats
      const thisWeekMinutes = Math.round((thisWeekData?.reduce((sum, item) => sum + Number(item.progress_seconds), 0) || 0) / 60);
      const lastWeekMinutes = Math.round((lastWeekData?.reduce((sum, item) => sum + Number(item.progress_seconds), 0) || 0) / 60);
      const weeklyChange = lastWeekMinutes > 0
        ? Math.round(((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100)
        : thisWeekMinutes > 0 ? 100 : 0;

      const completedVideos = completedData?.length || 0;
      const weeklyCompleted = thisWeekData?.filter(item => item.completed).length || 0;

      setLearningStats({
        weeklyMinutes: thisWeekMinutes,
        weeklyChange,
        completedVideos,
        weeklyCompleted
      });
    } catch (error) {
      console.error('Error loading learning stats:', error);
    }
  };

  useEffect(() => {
    let filtered = videos;

    if (searchQuery.trim()) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(video => video.category_id === selectedCategory);
    }

    setFilteredVideos(filtered);
  }, [searchQuery, videos, selectedCategory]);


  const hasAccess = (videoId: string): boolean => {
    const isActive = profile?.subscription_status === 'active';
    const hasPurchased = purchases.has(videoId);
    console.log('hasAccess check:', { videoId, isActive, hasPurchased, profile, purchases: Array.from(purchases) });
    if (isActive) return true;
    return hasPurchased;
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setVideoModalOpen(true);
  };

  const handlePurchase = (video: Video) => {
    setSelectedVideo(video);
    setVideoModalOpen(false);
    setPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async () => {
    if (!user || !selectedVideo) return;

    try {
      const { error } = await supabase.from('purchases').insert({
        user_id: user.id,
        video_id: selectedVideo.id,
        amount_paid: selectedVideo.price,
      });

      if (error) throw error;

      setPurchases(prev => new Set(prev).add(selectedVideo.id));
      setPaymentModalOpen(false);
      setVideoModalOpen(true);
    } catch (error) {
      console.error('Error completing purchase:', error);
      setPurchases(prev => new Set(prev).add(selectedVideo.id));
      setPaymentModalOpen(false);
      setVideoModalOpen(true);
    }
  };

  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    if (!user) {
      setSubscriptionModalOpen(false);
      setRedirectToSubscription(true);
      setAuthModalOpen(true);
      return;
    }

    const amount = plan === 'monthly' ? 99 : 999;
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (plan === 'monthly' ? 1 : 12));

    try {
      const { error: subError } = await supabase.from('subscriptions').insert({
        user_id: user.id,
        end_date: endDate.toISOString(),
        amount_paid: amount,
        status: 'active',
      });

      if (subError) throw subError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_end_date: endDate.toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setSubscriptionModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const getCategorizedVideos = () => {
    switch (selectedCategory) {
      case 'Featured':
        return filteredVideos.filter(v => v.is_featured);
      case 'New':
        return filteredVideos.filter(v => v.is_new);
      case 'Popular':
        return [...filteredVideos].sort((a, b) => b.view_count - a.view_count);
      case 'All':
        return filteredVideos;
      default:
        const category = categories.find(c => c.name === selectedCategory);
        return category ? filteredVideos.filter(v => v.category_id === category.id) : filteredVideos;
    }
  };

  const categoryButtons = [
    'All',
    'Featured',
    'New',
    'Popular',
    ...categories.map(c => c.name)
  ];

  const displayVideos = getCategorizedVideos();
  const featuredVideos = filteredVideos.filter(v => v.is_featured).slice(0, 6);
  const newVideos = filteredVideos.filter(v => v.is_new).slice(0, 6);
  const popularVideos = [...filteredVideos].sort((a, b) => b.view_count - a.view_count).slice(0, 6);

  const continueWatchingVideos = filteredVideos.filter(video => {
    const progress = watchProgress.get(video.id);
    return progress && !progress.completed && progress.progress_seconds > 0;
  }).slice(0, 6);

  const handleGuestSubscribeClick = () => {
    setSubscriptionModalOpen(true);
  };

  const handleAuthSuccess = () => {
    if (redirectToSubscription) {
      setRedirectToSubscription(false);
      setTimeout(() => {
        setSubscriptionModalOpen(true);
      }, 300);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading content...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // iPhone-inspired UI for signed-in users
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black">
        <Navbar
          onSearch={setSearchQuery}
          onAuthClick={() => setAuthModalOpen(true)}
          onSubscribeClick={() => setSubscriptionModalOpen(true)}
          onAccountClick={() => setAccountModalOpen(true)}
        />

        {!searchQuery && <Hero video={featuredVideos[0]} onPlay={handleVideoClick} onSubscribe={() => setSubscriptionModalOpen(true)} isSubscribed={profile?.subscription_status === 'active'} isLoggedIn={true} />}

        <div className={searchQuery ? 'pt-20 pb-12' : 'pb-12 -mt-24 sm:-mt-32 relative z-10'}>
          {searchQuery && filteredVideos.length === 0 && (
            <div className="text-center py-12 sm:py-20 px-4">
              <p className="text-white text-base sm:text-lg">No videos found matching "{searchQuery}"</p>
            </div>
          )}

          {searchQuery && filteredVideos.length > 0 && (
            <div className="mb-8 sm:mb-12 px-3 sm:px-4 md:px-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white">Search Results</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredVideos.map(video => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    hasAccess={hasAccess(video.id)}
                    onClick={handleVideoClick}
                  />
                ))}
              </div>
            </div>
          )}

          {!searchQuery && !selectedCategory && (
            <>
              <LearningStats
                weeklyMinutes={learningStats.weeklyMinutes}
                weeklyChange={learningStats.weeklyChange}
                completedVideos={learningStats.completedVideos}
                weeklyCompleted={learningStats.weeklyCompleted}
                subscriptionStatus={profile?.subscription_status || 'free'}
                onUpgrade={() => setSubscriptionModalOpen(true)}
              />

              {continueWatchingVideos.length > 0 && (
                <div className="mb-10 px-4 sm:px-6 md:px-8">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-white tracking-tight">Continue Watching</h2>
                  <ContinueWatchingRow
                    videos={continueWatchingVideos}
                    watchProgress={watchProgress}
                    hasAccess={hasAccess}
                    onClick={handleVideoClick}
                  />
                </div>
              )}

              {purchases.size > 0 && (
                <div className="mb-10 px-4 sm:px-6 md:px-8">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-white tracking-tight">My Purchased Videos</h2>
                  <VideoRow
                    videos={filteredVideos.filter(v => purchases.has(v.id))}
                    hasAccess={hasAccess}
                    onClick={handleVideoClick}
                  />
                </div>
              )}

              <div className="mb-10 px-4 sm:px-6 md:px-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-white tracking-tight">Featured Training</h2>
                <VideoRow videos={featuredVideos} hasAccess={hasAccess} onClick={handleVideoClick} />
              </div>

              <div className="mb-10 px-4 sm:px-6 md:px-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-white tracking-tight">New Releases</h2>
                <VideoRow videos={newVideos} hasAccess={hasAccess} onClick={handleVideoClick} />
              </div>

              <div className="mb-10 px-4 sm:px-6 md:px-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-white tracking-tight">Most Popular</h2>
                <VideoRow videos={popularVideos} hasAccess={hasAccess} onClick={handleVideoClick} />
              </div>

              <div className="mb-12 px-4 sm:px-6 md:px-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white tracking-tight">Browse by Category</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className="group relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 hover:border-white/40 hover:from-white/20 hover:to-white/10 transition-all duration-300"
                    >
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <h3 className="text-white font-semibold text-sm sm:text-base text-center leading-tight">
                          {category.name}
                        </h3>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedCategory && (
            <div className="px-4 sm:px-6 md:px-8">
              <div className="mb-6">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-white/70 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to All Videos
                </button>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-white tracking-tight">
                {categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredVideos.map(video => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    hasAccess={hasAccess(video.id)}
                    onClick={handleVideoClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
        <VideoModal
          isOpen={videoModalOpen}
          video={selectedVideo}
          onClose={() => setVideoModalOpen(false)}
          hasAccess={selectedVideo ? hasAccess(selectedVideo.id) : false}
          onPurchase={handlePurchase}
        />
        <SubscriptionModal
          isOpen={subscriptionModalOpen}
          onClose={() => setSubscriptionModalOpen(false)}
          onSubscribe={handleSubscribe}
        />
        <PaymentModal
          isOpen={paymentModalOpen}
          video={selectedVideo}
          onClose={() => setPaymentModalOpen(false)}
          onConfirm={handlePaymentConfirm}
        />
        <AccountManagement
          isOpen={accountModalOpen}
          onClose={() => setAccountModalOpen(false)}
        />
      </div>
    );
  }

  // Modern training platform UI for non-authenticated users
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e8eef3 50%, #d8dfe6 100%)' }}>
      <Navbar
        onSearch={setSearchQuery}
        onAuthClick={() => setAuthModalOpen(true)}
        onSubscribeClick={handleGuestSubscribeClick}
      />

      {!searchQuery && <Hero video={featuredVideos[0]} onPlay={handleVideoClick} onSubscribe={handleGuestSubscribeClick} isLoggedIn={false} />}

      <div className={searchQuery ? 'pt-16 sm:pt-20 px-3 sm:px-4 md:px-8' : 'px-3 sm:px-4 md:px-8 py-6 sm:py-8'}>
        {searchQuery && filteredVideos.length === 0 && (
          <div className="px-3 sm:px-4 md:px-12 py-12 sm:py-20 text-center">
            <p className="text-gray-900 text-base sm:text-xl">No videos found matching "{searchQuery}"</p>
          </div>
        )}

        {searchQuery && filteredVideos.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6" style={{ color: '#033a66' }}>Search Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredVideos.map(video => (
                <VideoCard
                  key={video.id}
                  video={video}
                  hasAccess={hasAccess(video.id)}
                  onClick={handleVideoClick}
                />
              ))}
            </div>
          </div>
        )}

        {!selectedCategory && (
          <>
            <div className="mb-12 sm:mb-16 md:mb-20">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6" style={{ color: '#033a66' }}>Featured Training</h2>
              <VideoRow videos={featuredVideos} hasAccess={hasAccess} onClick={handleVideoClick} />
            </div>

            <div className="mb-12 sm:mb-16 md:mb-20">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6" style={{ color: '#033a66' }}>New Releases</h2>
              <VideoRow videos={newVideos} hasAccess={hasAccess} onClick={handleVideoClick} />
            </div>

            <div className="mb-12 sm:mb-16 md:mb-20">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6" style={{ color: '#033a66' }}>Most Popular</h2>
              <VideoRow videos={popularVideos} hasAccess={hasAccess} onClick={handleVideoClick} />
            </div>

            <div className="mb-12 sm:mb-16 md:mb-20">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6" style={{ color: '#033a66' }}>Browse by Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="group relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 hover:scale-105 transition-transform duration-200 shadow-lg"
                  >
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center p-3">
                      <h3 className="text-white font-semibold text-sm text-center leading-tight drop-shadow-lg">
                        {category.name}
                      </h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedCategory && (
          <div>
            <div className="mb-4 sm:mb-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className="hover:opacity-70 transition flex items-center gap-2 text-sm sm:text-base"
                style={{ color: '#033a66' }}
              >
                <span>←</span> Back to All Videos
              </button>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6" style={{ color: '#033a66' }}>
              {categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredVideos.map(video => (
                <VideoCard
                  key={video.id}
                  video={video}
                  hasAccess={hasAccess(video.id)}
                  onClick={handleVideoClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 md:px-12 py-20 sm:py-28 md:py-32 text-center relative bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight text-gray-900">
            Choose your plan
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-16 text-gray-600 max-w-2xl mx-auto font-light">
            Access comprehensive professional tax training videos designed to enhance your expertise
          </p>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col">
              <h3 className="text-2xl font-semibold mb-6 text-gray-900">Monthly</h3>
              <div className="mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-gray-900">$18.99</span>
                  <span className="text-gray-500 text-lg font-light">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-grow text-left">
                <li className="flex items-start gap-3 text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Full access to all courses</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>New content every month</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Cancel anytime</span>
                </li>
              </ul>
              <button
                onClick={handleGuestSubscribeClick}
                className="w-full py-4 rounded-xl text-gray-900 font-semibold text-base bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Get Started
              </button>
            </div>

            <div className="group bg-gradient-to-b from-gray-900 to-black rounded-3xl p-8 shadow-2xl border border-gray-800 hover:shadow-3xl transition-all duration-300 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl">
                SAVE 43%
              </div>
              <h3 className="text-2xl font-semibold mb-6 text-white">Annual</h3>
              <div className="mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-white">$129.99</span>
                  <span className="text-gray-400 text-lg font-light">/year</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Just $10.83/month</p>
              </div>
              <ul className="space-y-3 mb-8 flex-grow text-left">
                <li className="flex items-start gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Everything in Monthly</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save over $97 per year</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Cancel anytime</span>
                </li>
              </ul>
              <button
                onClick={handleGuestSubscribeClick}
                className="w-full py-4 rounded-xl text-white font-semibold text-base bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            All plans include unlimited access to our entire library
          </p>
        </div>
      </div>

      <footer className="relative mt-20 sm:mt-32 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            <div>
              <h4 className="text-white/60 font-medium mb-4 text-xs uppercase tracking-wider">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#browse" className="text-white/80 hover:text-white transition-colors">Browse Videos</a></li>
                <li><a href="#pricing" className="text-white/80 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#subscribe" className="text-white/80 hover:text-white transition-colors">Subscribe</a></li>
                <li><a href="#about" className="text-white/80 hover:text-white transition-colors">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white/60 font-medium mb-4 text-xs uppercase tracking-wider">Programs</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#income" className="text-white/80 hover:text-white transition-colors">Income Tax</a></li>
                <li><a href="#gst" className="text-white/80 hover:text-white transition-colors">GST</a></li>
                <li><a href="#international" className="text-white/80 hover:text-white transition-colors">International Tax</a></li>
                <li><a href="#advanced" className="text-white/80 hover:text-white transition-colors">Advanced Programs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white/60 font-medium mb-4 text-xs uppercase tracking-wider">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#help" className="text-white/80 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#contact" className="text-white/80 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#faq" className="text-white/80 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#account" className="text-white/80 hover:text-white transition-colors">Account</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white/60 font-medium mb-4 text-xs uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#terms" className="text-white/80 hover:text-white transition-colors">Terms of Use</a></li>
                <li><a href="#privacy" className="text-white/80 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#cookies" className="text-white/80 hover:text-white transition-colors">Cookie Preferences</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-8 border-t border-white/10">
            <div className="flex flex-col gap-2">
              <p className="text-white/60 text-xs">Questions? Contact us.</p>
              <p className="text-white/40 text-xs">&copy; 2025 Tax Academy Singapore</p>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-white/60 hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors" aria-label="YouTube">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      <VideoModal
        isOpen={videoModalOpen}
        video={selectedVideo}
        onClose={() => setVideoModalOpen(false)}
        hasAccess={selectedVideo ? hasAccess(selectedVideo.id) : false}
        onPurchase={handlePurchase}
      />
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onSubscribe={handleSubscribe}
      />
      <PaymentModal
        isOpen={paymentModalOpen}
        video={selectedVideo}
        onClose={() => setPaymentModalOpen(false)}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
