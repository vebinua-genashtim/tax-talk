import { Search, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

interface NavbarProps {
  onSearch: (query: string) => void;
  onAuthClick: () => void;
  onSubscribeClick?: () => void;
  onProfileClick?: () => void;
  onAdvancedSearch?: () => void;
}

export function Navbar({ onSearch, onAuthClick, onSubscribeClick, onProfileClick, onAdvancedSearch }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (user) return; // Only hide navbar for guest view

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, user]);

  const handleSignOut = async () => {
    await signOut();
  };

  if (user) {
    // iPhone-style navbar for signed-in users
    return (
      <nav className="fixed top-0 w-full z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold">
              Tax Academy <span style={{ color: '#827546' }}>SG</span>
            </h1>
            {profile?.subscription_status === 'active' ? (
              <span className="px-2 py-0.5 rounded-full font-medium text-xs bg-green-100 text-green-700">
                Subscriber
              </span>
            ) : profile?.subscription_status === 'free' ? (
              <>
                <span className="px-2 py-0.5 rounded-full font-medium text-xs bg-blue-100 text-blue-700">
                  Pay-Per-View
                </span>
                <button
                  onClick={onSubscribeClick}
                  className="px-2 py-0.5 rounded-full font-medium text-xs text-white transition hover:opacity-90"
                  style={{ background: '#827546' }}
                >
                  Subscribe
                </button>
              </>
            ) : (
              <button
                onClick={onSubscribeClick}
                className="px-2 py-0.5 rounded-full font-medium text-xs text-white transition hover:opacity-90"
                style={{ background: '#827546' }}
              >
                Subscribe
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAdvancedSearch}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Search"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>

            {onProfileClick && (
              <button
                onClick={onProfileClick}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Profile Settings"
              >
                <Settings className="w-5 h-5 text-gray-700" />
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

      </nav>
    );
  }

  // Modern clean navbar for guests
  return (
    <nav
      className="fixed top-0 w-full z-50 px-6 md:px-12 py-4 transition-transform duration-300"
      style={{
        background: 'transparent',
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)'
      }}
    >
      <div className="flex items-center justify-between max-w-[1800px] mx-auto">
        <div className="flex items-center">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Tax Talk Pro
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onSubscribeClick || onAuthClick}
            className="px-5 py-2 rounded-md font-medium text-sm transition hover:opacity-90 text-white"
            style={{ background: 'linear-gradient(135deg, #827546 0%, #a08f5a 100%)' }}
          >
            Subscribe
          </button>

          <button
            onClick={onAuthClick}
            className="px-5 py-2 rounded-md font-medium text-sm transition hover:bg-white/10 border border-white/30 text-white"
          >
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
}
