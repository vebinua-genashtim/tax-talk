import { Crown, Calendar, CreditCard, RefreshCw } from 'lucide-react';

interface SubscriptionDetails {
  status: 'active' | 'expired' | 'free';
  planType?: 'monthly' | 'annual';
  startDate?: string;
  endDate?: string;
  nextBillingDate?: string;
  autoRenew?: boolean;
  paymentMethod?: string;
  amountPaid?: number;
}

interface SubscriptionStatusProps {
  subscription: SubscriptionDetails;
  onUpgrade: () => void;
  onManage?: () => void;
}

export function SubscriptionStatus({ subscription, onUpgrade, onManage }: SubscriptionStatusProps) {
  const isActive = subscription.status === 'active';
  const isFree = subscription.status === 'free';

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    if (!subscription.endDate) return null;
    const end = new Date(subscription.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysRemaining = getDaysRemaining();

  if (isFree) {
    return (
      <div className="mb-10 px-4 sm:px-6 md:px-8">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-gray-500/20 p-3 rounded-2xl">
                <Crown className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Free Plan</h3>
                <p className="text-white/60 text-sm">
                  Upgrade to Premium for unlimited access to all courses
                </p>
              </div>
            </div>
            <button
              onClick={onUpgrade}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold transition-colors whitespace-nowrap"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10 px-4 sm:px-6 md:px-8">
      <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-amber-500/30">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-amber-500/20 p-3 rounded-2xl">
            <Crown className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-bold text-white">Premium {subscription.planType === 'annual' ? 'Annual' : 'Monthly'}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isActive ? 'Active' : 'Expired'}
              </span>
            </div>
            <p className="text-white/60 text-sm">
              Unlimited access to all tax training courses
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {subscription.nextBillingDate && isActive && (
            <div className="bg-black/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-white/60" />
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                  Next Billing
                </p>
              </div>
              <p className="text-white font-semibold">
                {formatDate(subscription.nextBillingDate)}
              </p>
              {daysRemaining !== null && daysRemaining <= 7 && (
                <p className="text-yellow-400 text-xs mt-1">
                  Renews in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {subscription.endDate && (
            <div className="bg-black/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-white/60" />
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                  {isActive ? 'Valid Until' : 'Expired On'}
                </p>
              </div>
              <p className="text-white font-semibold">
                {formatDate(subscription.endDate)}
              </p>
            </div>
          )}

          {subscription.paymentMethod && (
            <div className="bg-black/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-white/60" />
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                  Payment Method
                </p>
              </div>
              <p className="text-white font-semibold capitalize">
                {subscription.paymentMethod}
              </p>
            </div>
          )}

          {subscription.autoRenew !== undefined && isActive && (
            <div className="bg-black/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-white/60" />
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                  Auto-Renewal
                </p>
              </div>
              <p className="text-white font-semibold">
                {subscription.autoRenew ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          )}
        </div>

        {onManage && (
          <div className="flex gap-3">
            <button
              onClick={onManage}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold transition-colors text-sm"
            >
              Manage Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
