import { Clock, Award, CreditCard, TrendingUp } from 'lucide-react';

interface LearningStatsProps {
  weeklyMinutes: number;
  weeklyChange: number;
  completedVideos: number;
  weeklyCompleted: number;
  subscriptionStatus: string;
  onUpgrade: () => void;
  hasPurchases?: boolean;
}

export function LearningStats({
  weeklyMinutes,
  weeklyChange,
  completedVideos,
  weeklyCompleted,
  subscriptionStatus,
  onUpgrade,
  hasPurchases = false
}: LearningStatsProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const isSubscribed = subscriptionStatus === 'active';
  const isPayPerView = !isSubscribed && hasPurchases;
  const displayPlan = isSubscribed ? 'Premium' : isPayPerView ? 'Pay-Per-View' : 'Free';

  return (
    <div className="mb-10 px-4 sm:px-6 md:px-8">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Your Learning Stats
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500/20 p-2.5 rounded-xl">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            {weeklyChange !== 0 && (
              <div className={`flex items-center space-x-1 text-xs font-semibold ${
                weeklyChange > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <TrendingUp className={`w-4 h-4 ${weeklyChange < 0 ? 'rotate-180' : ''}`} />
                <span>{weeklyChange > 0 ? '+' : ''}{weeklyChange}%</span>
              </div>
            )}
          </div>
          <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">This Week</h3>
          <p className="text-3xl font-bold text-white mb-1">
            {formatTime(weeklyMinutes)}
          </p>
          <p className="text-white/50 text-sm">
            {weeklyChange > 0 ? `+${Math.abs(weeklyChange)}% from last week` : weeklyChange < 0 ? `${weeklyChange}% from last week` : 'Same as last week'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500/20 p-2.5 rounded-xl">
              <Award className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">Completed</h3>
          <p className="text-3xl font-bold text-white mb-1">
            {completedVideos}
          </p>
          <p className="text-white/50 text-sm">
            {weeklyCompleted > 0 ? `${weeklyCompleted} this week` : 'No completions yet'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className={`${isSubscribed ? 'bg-amber-500/20' : 'bg-gray-500/20'} p-2.5 rounded-xl`}>
              <CreditCard className={`w-6 h-6 ${isSubscribed ? 'text-amber-400' : 'text-gray-400'}`} />
            </div>
            {!isSubscribed && (
              <button
                onClick={onUpgrade}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Upgrade
              </button>
            )}
          </div>
          <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">Plan</h3>
          <p className="text-3xl font-bold text-white mb-1 capitalize">
            {displayPlan}
          </p>
          <p className="text-white/50 text-sm">
            {isSubscribed ? 'Unlimited access' : isPayPerView ? 'Selected videos' : 'Limited access'}
          </p>
        </div>
      </div>
    </div>
  );
}
