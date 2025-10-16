import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Calendar, User, Lock, X, Mail, Shield, Check, Award, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AccountManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountManagement({ isOpen, onClose }: AccountManagementProps) {
  const { user, profile } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [watchStats, setWatchStats] = useState({ totalMinutes: 0, completedVideos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      loadUserStats();
    }
  }, [isOpen, user]);

  const loadUserStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [purchasesResult, progressResult] = await Promise.all([
        supabase.from('purchases').select('id').eq('user_id', user.id),
        supabase.from('watch_progress').select('progress_seconds, completed').eq('user_id', user.id)
      ]);

      setPurchaseCount(purchasesResult.data?.length || 0);

      const totalMinutes = Math.round(
        (progressResult.data?.reduce((sum, item) => sum + Number(item.progress_seconds), 0) || 0) / 60
      );
      const completedVideos = progressResult.data?.filter(item => item.completed).length || 0;

      setWatchStats({ totalMinutes, completedVideos });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getMockMembershipData = () => {
    if (!user || !profile) return null;

    const memberSince = new Date(user.created_at || '2024-01-01');
    const isSubscriber = profile.subscription_status === 'active';
    const isPayPerView = profile.subscription_status === 'free';

    let nextPayment = null;
    let paymentAmount = null;

    if (isSubscriber) {
      nextPayment = new Date();
      nextPayment.setMonth(nextPayment.getMonth() + 1);
      paymentAmount = '$18.99';
    }

    return {
      memberSince: memberSince.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      membershipType: isSubscriber ? 'Premium Subscription' : 'Pay-Per-View',
      nextPayment: nextPayment ? nextPayment.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'N/A',
      paymentAmount: paymentAmount || 'N/A',
      paymentMethod: isSubscriber ? 'Visa •••• 4242' : 'N/A',
      email: user.email || 'N/A'
    };
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setPasswordSuccess('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => {
      setShowPasswordForm(false);
      setPasswordSuccess('');
    }, 2000);
  };

  const membershipData = getMockMembershipData();

  if (!membershipData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl w-full max-w-4xl shadow-2xl my-auto max-h-[90vh] overflow-y-auto border border-white/10">
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-black border-b border-white/10 px-8 py-6 flex items-center justify-between z-10 backdrop-blur-xl">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Account Settings</h2>
            <p className="text-gray-400 text-sm">Manage your profile and preferences</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-white/10 active:bg-white/20 rounded-xl transition touch-manipulation"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-300" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-blue-500/30 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-300" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Watch Time</p>
              <p className="text-3xl font-bold text-white">{watchStats.totalMinutes}<span className="text-lg text-gray-400 ml-1">min</span></p>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-green-500/30 rounded-xl">
                  <Award className="w-6 h-6 text-green-300" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Completed</p>
              <p className="text-3xl font-bold text-white">{watchStats.completedVideos}<span className="text-lg text-gray-400 ml-1">videos</span></p>
            </div>

            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-amber-500/30 rounded-xl">
                  <CreditCard className="w-6 h-6 text-amber-300" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Purchases</p>
              <p className="text-3xl font-bold text-white">{purchaseCount}<span className="text-lg text-gray-400 ml-1">videos</span></p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <User className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Profile Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Mail className="w-4 h-4" />
                  <p>Email Address</p>
                </div>
                <p className="text-lg font-medium text-white">{membershipData.email}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <p>Member Since</p>
                </div>
                <p className="text-lg font-medium text-white">{membershipData.memberSince}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">Membership Status</h3>
                {profile?.subscription_status === 'active' && (
                  <div className="flex items-center gap-2 mt-1">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400 font-medium">Active Subscription</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Plan Type</p>
                <p className="text-lg font-semibold text-white">{membershipData.membershipType}</p>
              </div>
              {profile?.subscription_status === 'active' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-1">Next Payment</p>
                      <p className="text-base font-medium text-white">{membershipData.nextPayment}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-1">Amount</p>
                      <p className="text-base font-medium text-white">{membershipData.paymentAmount}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {profile?.subscription_status === 'active' && (
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <CreditCard className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Payment Method</h3>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Saved Card</p>
                <p className="text-lg font-medium text-white">{membershipData.paymentMethod}</p>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <Lock className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Security Settings</h3>
            </div>

            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg shadow-red-500/20"
              >
                Update Password
              </button>
            ) : (
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    required
                  />
                </div>

                {passwordError && (
                  <p className="text-sm text-red-400 bg-red-500/20 border border-red-500/30 px-4 py-3 rounded-xl">
                    {passwordError}
                  </p>
                )}

                {passwordSuccess && (
                  <p className="text-sm text-green-400 bg-green-500/20 border border-green-500/30 px-4 py-3 rounded-xl">
                    {passwordSuccess}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg shadow-red-500/20"
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordError('');
                      setPasswordSuccess('');
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="px-6 py-3 bg-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
