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
    <div className="mb-12 sm:mb-16 md:mb-20 px-3 sm:px-4 md:px-12">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
          Your Learning Stats
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">Keep up the great work</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* This Week */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 sm:p-6 border border-gray-700 hover:border-gray-600 transition">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-blue-500/10 p-2 sm:p-2.5 rounded-lg">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
            {weeklyChange !== 0 && (
              <div className={`flex items-center space-x-1 text-xs sm:text-sm ${
                weeklyChange > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 ${weeklyChange < 0 ? 'rotate-180' : ''}`} />
                <span>{weeklyChange > 0 ? '+' : ''}{weeklyChange}%</span>
              </div>
            )}
          </div>
          <h3 className="text-gray-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2">This Week</h3>
          <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
            {formatTime(weeklyMinutes)}
          </p>
          <p className="text-gray-500 text-xs sm:text-sm">
            {weeklyChange > 0 ? `+${Math.abs(weeklyChange)}% from last week` : weeklyChange < 0 ? `${weeklyChange}% from last week` : 'Same as last week'}
          </p>
        </div>

        {/* Videos Completed */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 sm:p-6 border border-gray-700 hover:border-gray-600 transition">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-green-500/10 p-2 sm:p-2.5 rounded-lg">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            </div>
          </div>
          <h3 className="text-gray-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Videos Completed</h3>
          <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
            {completedVideos}
          </p>
          <p className="text-gray-500 text-xs sm:text-sm">
            {weeklyCompleted > 0 ? `${weeklyCompleted} ${weeklyCompleted === 1 ? 'more' : 'more'} this week` : 'Start watching to track progress'}
          </p>
        </div>

        {/* Subscription */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 sm:p-6 border border-gray-700 hover:border-gray-600 transition sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className={`${isSubscribed ? 'bg-purple-500/10' : 'bg-gray-500/10'} p-2 sm:p-2.5 rounded-lg`}>
              <CreditCard className={`w-5 h-5 sm:w-6 sm:h-6 ${isSubscribed ? 'text-purple-400' : 'text-gray-400'}`} />
            </div>
            {!isSubscribed && (
              <button
                onClick={onUpgrade}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:scale-105 transition"
              >
                Upgrade
              </button>
            )}
          </div>
          <h3 className="text-gray-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Subscription</h3>
          <p className="text-2xl sm:text-3xl font-bold text-white mb-1 capitalize">
            {isSubscribed ? 'Premium' : 'Free'}
          </p>
          <p className="text-gray-500 text-xs sm:text-sm">
            {isSubscribed ? 'Unlimited access to all videos' : 'Upgrade available'}
          </p>
        </div>
      </div>
    </div>
  );
}
