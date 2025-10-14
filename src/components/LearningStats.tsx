import { TrendingUp, Award, Clock } from 'lucide-react';

interface LearningStatsProps {
  weeklyMinutes: number;
  weeklyChange: number;
  completedVideos: number;
  weeklyCompleted: number;
  subscriptionStatus: 'free' | 'active' | 'cancelled';
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
  return (
    <div className="mb-10 px-4 sm:px-6 md:px-8">
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Your Progress</h2>
            <p className="text-white/60 text-sm sm:text-base">Keep learning and improving</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <p className="text-xs text-white/60">Plan</p>
              <p className="text-white font-semibold">
                {subscriptionStatus === 'active' ? 'Premium Member' : 'Free'}
              </p>
            </div>
            {subscriptionStatus !== 'active' && (
              <button
                onClick={onUpgrade}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/50"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-8 h-8 text-blue-400" />
              {weeklyChange !== 0 && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${weeklyChange > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {weeklyChange > 0 ? '+' : ''}{weeklyChange}%
                </span>
              )}
            </div>
            <p className="text-white/60 text-sm mb-1">This Week</p>
            <p className="text-3xl font-bold text-white">{weeklyMinutes}<span className="text-lg text-white/60 ml-1">min</span></p>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <Award className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-white/60 text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold text-white">{completedVideos}<span className="text-lg text-white/60 ml-1">total</span></p>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-white/60 text-sm mb-1">This Week</p>
            <p className="text-3xl font-bold text-white">{weeklyCompleted}<span className="text-lg text-white/60 ml-1">videos</span></p>
          </div>
        </div>

        {subscriptionStatus !== 'active' && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-white/80 text-sm">
              <span className="font-semibold">Limited access.</span> Upgrade to Premium for unlimited access to all videos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
