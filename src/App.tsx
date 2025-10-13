import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VideoRow } from './components/VideoRow';
import { VideoCard } from './components/VideoCard';
import { MobileVideoCard } from './components/MobileVideoCard';
import { AuthModal } from './components/AuthModal';
import { VideoModal } from './components/VideoModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { PaymentModal } from './components/PaymentModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Video, Category, supabase } from './lib/supabase';
import { mockVideos, mockCategories } from './data/mockData';

function AppContent() {
  const { user, profile } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [purchases, setPurchases] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
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
    } else {
      setPurchases(new Set());
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
    // Netflix-style UI for signed-in users
    return (
      <div className="min-h-screen bg-black">
        <Navbar
          onSearch={setSearchQuery}
          onAuthClick={() => setAuthModalOpen(true)}
          onSubscribeClick={() => setSubscriptionModalOpen(true)}
        />

        {!searchQuery && <Hero video={featuredVideos[0]} onPlay={handleVideoClick} onSubscribe={() => setSubscriptionModalOpen(true)} isSubscribed={profile?.subscription_status === 'active'} isLoggedIn={true} />}

        <div className={searchQuery ? 'pt-16 sm:pt-20 pb-12 sm:pb-20' : 'pb-12 sm:pb-20 -mt-20 sm:-mt-32 relative z-10'}>
          {!searchQuery && (
            <div className="px-3 sm:px-4 md:px-12 mb-6 sm:mb-8">
              <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold whitespace-nowrap transition-all text-sm sm:text-base ${
                    !selectedCategory
                      ? 'bg-white text-black'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold whitespace-nowrap transition-all text-sm sm:text-base ${
                      selectedCategory === category.id
                        ? 'bg-white text-black'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {searchQuery && filteredVideos.length === 0 && (
            <div className="text-center py-12 sm:py-20 px-4">
              <p className="text-white text-base sm:text-lg">No videos found matching "{searchQuery}"</p>
            </div>
          )}

          {searchQuery && filteredVideos.length > 0 && (
            <div className="mb-8 sm:mb-12 px-3 sm:px-4 md:px-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white">Search Results</h2>
              <VideoRow videos={filteredVideos} hasAccess={hasAccess} onClick={handleVideoClick} />
            </div>
          )}

          {!searchQuery && !selectedCategory && (
            <>
              {purchases.size > 0 && (
                <div className="mb-12 sm:mb-16 md:mb-20 px-3 sm:px-4 md:px-12">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white">My Purchased Videos</h2>
                  <VideoRow
                    videos={filteredVideos.filter(v => purchases.has(v.id))}
                    hasAccess={hasAccess}
                    onClick={handleVideoClick}
                  />
                </div>
              )}

              <div className="mb-12 sm:mb-16 md:mb-20 px-3 sm:px-4 md:px-12">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white">Featured Training</h2>
                <VideoRow videos={featuredVideos} hasAccess={hasAccess} onClick={handleVideoClick} />
              </div>

              <div className="mb-12 sm:mb-16 md:mb-20 px-3 sm:px-4 md:px-12">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white">New Releases</h2>
                <VideoRow videos={newVideos} hasAccess={hasAccess} onClick={handleVideoClick} />
              </div>

              <div className="mb-12 sm:mb-16 md:mb-20 px-3 sm:px-4 md:px-12">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white">Most Popular</h2>
                <VideoRow videos={popularVideos} hasAccess={hasAccess} onClick={handleVideoClick} />
              </div>
            </>
          )}

          {!searchQuery && selectedCategory && (
            <div className="px-3 sm:px-4 md:px-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white">
                {categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                {filteredVideos.map(video => (
                  <div key={video.id} className="w-full">
                    <VideoCard
                      video={video}
                      hasAccess={hasAccess(video.id)}
                      onClick={handleVideoClick}
                    />
                  </div>
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
        {!searchQuery && (
          <div className="mb-6 sm:mb-8">
            <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold whitespace-nowrap transition-all text-sm sm:text-base ${
                  !selectedCategory
                    ? 'text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:shadow-md'
                }`}
                style={!selectedCategory ? { background: 'linear-gradient(135deg, #033a66 0%, #044d85 100%)' } : {}}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold whitespace-nowrap transition-all text-sm sm:text-base ${
                    selectedCategory === category.id
                      ? 'text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:shadow-md'
                  }`}
                  style={selectedCategory === category.id ? { background: 'linear-gradient(135deg, #033a66 0%, #044d85 100%)' } : {}}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {searchQuery && filteredVideos.length === 0 && (
          <div className="px-3 sm:px-4 md:px-12 py-12 sm:py-20 text-center">
            <p className="text-gray-900 text-base sm:text-xl">No videos found matching "{searchQuery}"</p>
          </div>
        )}

        {searchQuery && filteredVideos.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6" style={{ color: '#033a66' }}>Search Results</h2>
            <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {filteredVideos.map(video => (
                <div key={video.id} className="flex-shrink-0 w-[180px] sm:w-[200px] md:w-[240px]">
                  <VideoCard
                    video={video}
                    hasAccess={hasAccess(video.id)}
                    onClick={handleVideoClick}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {!searchQuery && !selectedCategory && (
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
          </>
        )}

        {!searchQuery && selectedCategory && (
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6" style={{ color: '#033a66' }}>
              {categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {filteredVideos.map(video => (
                <div key={video.id} className="w-full">
                  <VideoCard
                    video={video}
                    hasAccess={hasAccess(video.id)}
                    onClick={handleVideoClick}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-3 sm:px-4 md:px-12 py-12 sm:py-16 md:py-20 text-center relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 drop-shadow-lg" style={{ color: '#033a66' }}>
            Subscribe Today
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 md:mb-12 px-2" style={{ color: '#1f2937' }}>
            Subscribe today to access comprehensive, professional tax training videos designed to enhance your expertise.
          </p>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-gray-200 hover:border-gray-300 transition flex flex-col">
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#033a66' }}>Monthly</h3>
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold" style={{ color: '#827546' }}>$18.99</span>
                <span className="text-gray-600 text-sm sm:text-base">/mo</span>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 flex-grow">Charged once per month. Cancel anytime.</p>
              <button
                onClick={handleGuestSubscribeClick}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-white font-semibold text-base sm:text-lg transition hover:scale-105 hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, #827546 0%, #a08f5a 100%)', boxShadow: '0 4px 15px rgba(130, 117, 70, 0.4)' }}
              >
                SUBSCRIBE
              </button>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-gray-200 hover:border-gray-300 transition relative flex flex-col">
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-red-500 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full">
                BEST VALUE
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#033a66' }}>Annually</h3>
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold" style={{ color: '#827546' }}>$129.99</span>
                <span className="text-gray-600 text-sm sm:text-base">/yr</span>
              </div>
              <div className="flex-grow">
                <p className="text-gray-600 text-sm sm:text-base mb-2">Only $10.83 per month!</p>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">Charged once per year. Cancel anytime.</p>
              </div>
              <button
                onClick={handleGuestSubscribeClick}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-white font-semibold text-base sm:text-lg transition hover:scale-105 hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, #827546 0%, #a08f5a 100%)', boxShadow: '0 4px 15px rgba(130, 117, 70, 0.4)' }}
              >
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-10 md:pb-12 px-3 sm:px-4 md:px-12" style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(3, 58, 102, 0.02) 2%, rgba(3, 56, 98, 0.05) 4%, rgba(3, 54, 95, 0.08) 6%, rgba(3, 52, 91, 0.12) 8%, rgba(3, 50, 88, 0.16) 10%, rgba(3, 48, 84, 0.20) 12%, rgba(3, 46, 81, 0.24) 14%, rgba(3, 44, 77, 0.28) 16%, rgba(3, 42, 74, 0.32) 18%, rgba(3, 40, 70, 0.36) 20%, rgba(3, 38, 67, 0.40) 22%, rgba(3, 36, 63, 0.44) 24%, rgba(3, 34, 60, 0.48) 26%, rgba(2, 32, 56, 0.52) 28%, rgba(2, 30, 53, 0.56) 30%, rgba(2, 28, 49, 0.62) 34%, rgba(2, 26, 45, 0.68) 38%, rgba(2, 24, 41, 0.74) 42%, rgba(2, 22, 37, 0.80) 46%, rgba(2, 20, 33, 0.86) 50%, rgba(2, 18, 29, 0.91) 56%, rgba(1, 16, 26, 0.94) 62%, rgba(1, 12, 20, 0.96) 72%, rgba(0, 8, 14, 0.98) 82%, rgba(0, 4, 8, 0.99) 92%, rgba(0, 0, 0, 1) 100%)', marginTop: '-8rem', paddingTop: '12rem' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-12 md:mb-16">
            <div className="sm:col-span-2">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Tax Academy Singapore</h3>
              <p className="text-white text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                Leading provider of professional tax training and certification programs for accounting professionals across Singapore and beyond.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li><a href="#browse" className="text-white hover:text-gray-200 transition">Browse Videos</a></li>
                <li><a href="#pricing" className="text-white hover:text-gray-200 transition">Pricing</a></li>
                <li><a href="#subscribe" className="text-white hover:text-gray-200 transition">Subscribe</a></li>
                <li><a href="#about" className="text-white hover:text-gray-200 transition">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li><a href="#help" className="text-white hover:text-gray-200 transition">Help Center</a></li>
                <li><a href="#contact" className="text-white hover:text-gray-200 transition">Contact Us</a></li>
                <li><a href="#faq" className="text-white hover:text-gray-200 transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li><a href="#terms" className="text-white hover:text-gray-200 transition">Terms of Service</a></li>
                <li><a href="#privacy" className="text-white hover:text-gray-200 transition">Privacy Policy</a></li>
                <li><a href="#cookies" className="text-white hover:text-gray-200 transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600/40 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-white gap-4">
            <p className="text-center sm:text-left">&copy; 2025 Tax Academy Singapore. All rights reserved.</p>
            <div className="flex gap-4 sm:gap-6">
              <a href="#" className="hover:text-gray-300 transition">LinkedIn</a>
              <a href="#" className="hover:text-gray-300 transition">Twitter</a>
              <a href="#" className="hover:text-gray-300 transition">YouTube</a>
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
