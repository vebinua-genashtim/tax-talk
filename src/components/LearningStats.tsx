import { Clock, Award, CreditCard, TrendingUp } from 'lucide-react';

interface LearningStatsProps {
  weeklyMinutes: number;
  weeklyChange: number;
  completedVideos: number;
  weeklyCompleted: number;
  subscriptionStatus: string;
  onUpgrade: () => void;
}

export function LearningStats({
  weeklyMinutes,
  weeklyChange,
  completedVideos,
  weeklyCompleted,
  subscriptionStatus,
  onUpgrade
}: LearningStatsProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const isSubscribed = subscriptionStatus === 'active';

  return (
    <div className="mb-6 px-4 sm:px-6">
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-0.5">
          Your Learning Stats
        </h2>
        <p className="text-gray-400 text-sm">Keep up the great work</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* This Week */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all active:scale-[0.98]">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-500/20 p-2 rounded-xl">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            {weeklyChange !== 0 && (
              <div className={`flex items-center space-x-1 text-xs font-medium ${
                weeklyChange > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <TrendingUp className={`w-3.5 h-3.5 ${weeklyChange < 0 ? 'rotate-180' : ''}`} />
                <span>{weeklyChange > 0 ? '+' : ''}{weeklyChange}%</span>
              </div>
            )}
          </div>
          <h3 className="text-gray-400 text-xs font-medium mb-1">This Week</h3>
          <p className="text-2xl font-semibold text-white mb-1">
            {formatTime(weeklyMinutes)}
          </p>
          <p className="text-gray-500 text-xs">
            {weeklyChange > 0 ? `+${Math.abs(weeklyChange)}% from last week` : weeklyChange < 0 ? `${weeklyChange}% from last week` : 'Same as last week'}
          </p>
        </div>

        {/* Videos Completed */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all active:scale-[0.98]">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-green-500/20 p-2 rounded-xl">
              <Award className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <h3 className="text-gray-400 text-xs font-medium mb-1">Videos Completed</h3>
          <p className="text-2xl font-semibold text-white mb-1">
            {completedVideos}
          </p>
          <p className="text-gray-500 text-xs">
            {weeklyCompleted > 0 ? `${weeklyCompleted} more this week` : 'Start watching to track progress'}
          </p>
        </div>

        {/* Subscription */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all active:scale-[0.98] sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className={`${isSubscribed ? 'bg-purple-500/20' : 'bg-gray-500/20'} p-2 rounded-xl`}>
              <CreditCard className={`w-5 h-5 ${isSubscribed ? 'text-purple-400' : 'text-gray-400'}`} />
            </div>
            {!isSubscribed && (
              <button
                onClick={onUpgrade}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-xs font-semibold hover:shadow-lg hover:scale-105 transition-all active:scale-95"
              >
                Upgrade
              </button>
            )}
          </div>
          <h3 className="text-gray-400 text-xs font-medium mb-1">Subscription</h3>
          <p className="text-2xl font-semibold text-white mb-1 capitalize">
            {isSubscribed ? 'Premium' : 'Free'}
          </p>
          <p className="text-gray-500 text-xs">
            {isSubscribed ? 'Unlimited access to all videos' : 'Upgrade available'}
          </p>
        </div>
      </div>
    </div>
  );
}
