import { X, User, CreditCard, Crown, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { initializeDemoUsers } from '../lib/initDemoUsers';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

interface DemoAccount {
  email: string;
  password: string;
  name: string;
  type: 'free' | 'pay-per-view' | 'subscriber';
  description: string;
  icon: React.ReactNode;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializingDemo, setInitializingDemo] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleInitializeDemoUsers = async () => {
    setInitializingDemo(true);
    setError('');
    try {
      const results = await initializeDemoUsers();
      setError('');
      const message = 'Demo users setup complete!\n\n' + results.join('\n') + '\n\nYou can now click the demo account buttons to sign in.';
      alert(message);
    } catch (err: any) {
      setError('Error creating demo users: ' + (err.message || 'Unknown error'));
      console.error('Demo user creation error:', err);
    } finally {
      setInitializingDemo(false);
    }
  };

  if (!isOpen) return null;

  const demoAccounts: DemoAccount[] = [
    {
      email: 'free@taxacademy.sg',
      password: 'demo123456',
      name: 'Free User',
      type: 'free',
      description: 'Watch trailers only',
      icon: <User className="w-5 h-5" />,
    },
    {
      email: 'payper@taxacademy.sg',
      password: 'demo123456',
      name: 'Pay-Per-View User',
      type: 'pay-per-view',
      description: 'Purchased 2 videos',
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      email: 'subscriber@taxacademy.sg',
      password: 'demo123456',
      name: 'Subscriber',
      type: 'subscriber',
      description: 'Full access to all videos',
      icon: <Crown className="w-5 h-5" />,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
      onClose();
      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 md:p-8 relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 active:text-gray-900 p-1 touch-manipulation"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#033a66' }}>
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
          Access Tax Academy Singapore training platform
        </p>

        {showDemoAccounts && !isSignUp && (
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Demo Accounts</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleInitializeDemoUsers}
                  disabled={initializingDemo}
                  className="flex items-center space-x-1 text-sm px-3 py-1 rounded transition disabled:opacity-50"
                  style={{ backgroundColor: '#827546', color: 'white' }}
                >
                  <Wand2 className="w-4 h-4" />
                  <span>{initializingDemo ? 'Creating...' : 'Create Demo Users'}</span>
                </button>
                <button
                  onClick={() => setShowDemoAccounts(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Hide
                </button>
              </div>
            </div>
            <div className="space-y-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
              {demoAccounts.map((account) => (
                <div key={account.email} className="text-xs sm:text-sm">
                  <p className="font-semibold text-gray-800">{account.name}</p>
                  <p className="text-gray-600">{account.description}</p>
                  <p className="text-gray-700 font-mono mt-1 text-xs">
                    {account.email} / demo123456
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Use the credentials above in the sign in form below to test different access levels.
              </p>
            </div>
          </div>
        )}

        {!showDemoAccounts && !isSignUp && (
          <button
            onClick={() => setShowDemoAccounts(true)}
            className="mb-4 text-sm hover:underline"
            style={{ color: '#827546' }}
          >
            Show Demo Accounts
          </button>
        )}

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {isSignUp ? 'Create Your Account' : 'Sign In With Your Account'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded text-white font-semibold transition active:scale-95 disabled:opacity-50 shadow-lg touch-manipulation"
              style={{ background: 'linear-gradient(135deg, #033a66 0%, #044d87 100%)', boxShadow: '0 4px 15px rgba(3, 58, 102, 0.3)' }}
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm hover:underline"
              style={{ color: '#827546' }}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
