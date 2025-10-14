import { User, Crown, Package } from 'lucide-react';

interface WelcomeBannerProps {
  userName: string;
  subscriptionStatus: 'free' | 'active' | 'expired';
  subscriptionEndDate?: string;
  purchaseCount: number;
}

export function WelcomeBanner({
  userName,
  subscriptionStatus,
  subscriptionEndDate,
  purchaseCount
}: WelcomeBannerProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusInfo = () => {
    if (subscriptionStatus === 'active') {
      return {
        icon: <Crown className="w-5 h-5 text-amber-400" />,
        text: 'Premium Member',
        subtext: subscriptionEndDate
          ? `Active until ${new Date(subscriptionEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
          : 'Unlimited Access',
        bgColor: 'from-amber-500/20 to-orange-500/10',
        borderColor: 'border-amber-500/30'
      };
    }

    if (purchaseCount > 0) {
      return {
        icon: <Package className="w-5 h-5 text-blue-400" />,
        text: 'Pay-Per-View Member',
        subtext: `${purchaseCount} video${purchaseCount !== 1 ? 's' : ''} owned`,
        bgColor: 'from-blue-500/20 to-cyan-500/10',
        borderColor: 'border-blue-500/30'
      };
    }

    return {
      icon: <User className="w-5 h-5 text-gray-400" />,
      text: 'Free Member',
      subtext: 'Upgrade to unlock all content',
      bgColor: 'from-white/10 to-white/5',
      borderColor: 'border-white/20'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10">
      <div className={`bg-gradient-to-r ${statusInfo.bgColor} backdrop-blur-sm rounded-3xl p-6 sm:p-8 border ${statusInfo.borderColor}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
              {getGreeting()}, {userName || 'Welcome'}
            </h1>
            <p className="text-white/70 text-sm sm:text-base">
              Ready to continue your tax training journey?
            </p>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10">
            {statusInfo.icon}
            <div>
              <p className="text-white font-semibold text-sm">{statusInfo.text}</p>
              <p className="text-white/60 text-xs">{statusInfo.subtext}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
