import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Calendar, User, Lock, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Account Management</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <User className="w-5 h-5 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="text-base font-medium text-gray-900">{membershipData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-base font-medium text-gray-900">{membershipData.memberSince}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Calendar className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Membership Details</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Membership Type</p>
                <p className="text-base font-medium text-gray-900">{membershipData.membershipType}</p>
              </div>
              {profile?.subscription_status === 'active' && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Next Payment Date</p>
                    <p className="text-base font-medium text-gray-900">{membershipData.nextPayment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Amount</p>
                    <p className="text-base font-medium text-gray-900">{membershipData.paymentAmount}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {profile?.subscription_status === 'active' && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <CreditCard className="w-5 h-5 text-green-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
              </div>
              <div>
                <p className="text-sm text-gray-500">Saved Card</p>
                <p className="text-base font-medium text-gray-900">{membershipData.paymentMethod}</p>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Lock className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
            </div>

            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="px-4 py-2 bg-white text-purple-700 font-medium rounded-lg hover:bg-purple-50 transition border border-purple-200"
              >
                Update Password
              </button>
            ) : (
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                {passwordError && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    {passwordError}
                  </p>
                )}

                {passwordSuccess && (
                  <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    {passwordSuccess}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition"
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
                    className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
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
