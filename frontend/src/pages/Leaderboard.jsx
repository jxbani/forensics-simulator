import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy, Medal, Crown, Star, TrendingUp, TrendingDown, Minus,
  Award, Target, Zap, ChevronUp, ChevronDown, Loader2, AlertCircle,
  Shield, Users, Calendar, Clock, Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import leaderboardService from '../services/leaderboardService';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all'); // all, month, week
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLeaderboard();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [timeFilter]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await leaderboardService.getGlobalLeaderboard(100);
      const leaderboardArray = data.leaderboard || data || [];
      setLeaderboardData(leaderboardArray);

      // Find current user's rank
      if (user) {
        const userIndex = leaderboardArray.findIndex(entry => entry.userId === user.id);
        if (userIndex !== -1) {
          setMyRank({
            rank: userIndex + 1,
            ...leaderboardArray[userIndex]
          });
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMedalConfig = (rank) => {
    if (rank === 1) return {
      icon: Crown,
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/50',
      textColor: 'text-yellow-400',
      emoji: '🥇'
    };
    if (rank === 2) return {
      icon: Medal,
      color: 'from-gray-300 to-gray-500',
      bgColor: 'bg-gray-400/20',
      borderColor: 'border-gray-400/50',
      textColor: 'text-gray-300',
      emoji: '🥈'
    };
    if (rank === 3) return {
      icon: Award,
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/50',
      textColor: 'text-orange-400',
      emoji: '🥉'
    };
    return null;
  };

  const getCompletionRate = (entry) => {
    if (!entry.levelsCompleted || !entry.totalLevels) return 0;
    return Math.round((entry.levelsCompleted / entry.totalLevels) * 100);
  };

  const getPointsToNextRank = () => {
    if (!myRank || myRank.rank === 1) return null;
    const nextRankEntry = leaderboardData[myRank.rank - 2];
    if (!nextRankEntry) return null;
    return nextRankEntry.totalScore - myRank.totalScore;
  };

  const getRankChangeIndicator = (change) => {
    if (!change || change === 0) return <Minus className="w-4 h-4 text-slate-400" />;
    if (change > 0) return <ChevronUp className="w-4 h-4 text-green-400" />;
    return <ChevronDown className="w-4 h-4 text-red-400" />;
  };

  const formatScore = (score) => {
    return score.toLocaleString();
  };

  // Pagination
  const totalPages = Math.ceil((leaderboardData.length - 3) / itemsPerPage); // Exclude top 3
  const startIndex = 3 + (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = leaderboardData.slice(startIndex, endIndex);

  // Loading State
  if (loading && leaderboardData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const topThree = leaderboardData.slice(0, 3);
  const pointsToNext = getPointsToNextRank();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
                <p className="text-slate-300 text-sm">Top Forensic Investigators</p>
              </div>
            </div>

            <nav className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all"
              >
                Dashboard
              </Link>
              <Link
                to="/forensic-lab"
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all"
              >
                Forensic Lab
              </Link>
              <Link
                to="/leaderboard"
                className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg font-medium border border-yellow-500/30"
              >
                Leaderboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Filter Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-2 border border-white/20 mb-8 inline-flex gap-2">
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              timeFilter === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Trophy className="w-4 h-4" />
            All Time
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              timeFilter === 'month'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
            This Month
          </button>
          <button
            onClick={() => setTimeFilter('week')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              timeFilter === 'week'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            This Week
          </button>
        </div>

        {/* Current User Rank Card (if not in top 10) */}
        {myRank && myRank.rank > 10 && (
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-6 border-2 border-purple-500/30 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Your Rank</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-purple-300">#{myRank.rank}</span>
                    <span className="text-slate-300">{formatScore(myRank.totalScore)} points</span>
                  </div>
                  {pointsToNext && (
                    <p className="text-sm text-purple-200 mt-1">
                      {pointsToNext} points to rank #{myRank.rank - 1}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-300 mb-1">Completion Rate</div>
                <div className="text-2xl font-bold text-white">{getCompletionRate(myRank)}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Motivational Message */}
        {myRank && pointsToNext && myRank.rank > 1 && myRank.rank <= 10 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8 flex items-center gap-3">
            <Flame className="w-6 h-6 text-orange-400 flex-shrink-0" />
            <p className="text-blue-200">
              You're just <span className="font-bold text-white">{pointsToNext} points</span> away from rank <span className="font-bold text-white">#{myRank.rank - 1}</span>! Keep going!
            </p>
          </div>
        )}

        {/* Top 3 Podium */}
        {topThree.length >= 3 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Crown className="w-7 h-7 text-yellow-400" />
              Top Investigators
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="order-1 md:order-1">
                  <PodiumCard
                    entry={topThree[1]}
                    rank={2}
                    isCurrentUser={user && topThree[1].userId === user.id}
                  />
                </div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <div className="order-2 md:order-2">
                  <PodiumCard
                    entry={topThree[0]}
                    rank={1}
                    isCurrentUser={user && topThree[0].userId === user.id}
                    isFirst
                  />
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="order-3 md:order-3">
                  <PodiumCard
                    entry={topThree[2]}
                    rank={3}
                    isCurrentUser={user && topThree[2].userId === user.id}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Remaining Rankings Table */}
        {leaderboardData.length > 3 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-7 h-7" />
              All Rankings
            </h2>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Rank</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Investigator</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Score</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Levels</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Completion</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedData.map((entry, index) => {
                      const rank = startIndex + index + 1;
                      const isCurrentUser = user && entry.userId === user.id;
                      const completionRate = getCompletionRate(entry);

                      return (
                        <tr
                          key={entry.userId}
                          className={`transition-all ${
                            isCurrentUser
                              ? 'bg-blue-500/20 border-l-4 border-l-blue-500'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getRankChangeIndicator(entry.rankChange)}
                              <span className={`text-lg font-bold ${isCurrentUser ? 'text-blue-300' : 'text-white'}`}>
                                #{rank}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {entry.username?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-white flex items-center gap-2">
                                  {entry.username}
                                  {isCurrentUser && (
                                    <span className="px-2 py-0.5 bg-blue-500/30 text-blue-300 text-xs rounded-full border border-blue-500/50">
                                      You
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-white font-bold text-lg">
                              {formatScore(entry.totalScore)}
                            </div>
                            <div className="text-slate-400 text-xs">points</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="text-white font-medium">
                              {entry.levelsCompleted || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-center">
                              <div className="w-full max-w-[100px] bg-slate-700 rounded-full h-2 mb-1">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                                  style={{ width: `${completionRate}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-300">{completionRate}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-white font-medium">
                              {entry.accuracy ? `${Math.round(entry.accuracy)}%` : 'N/A'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-t border-white/10">
                  <div className="text-sm text-slate-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, leaderboardData.length)} of {leaderboardData.length}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && leaderboardData.length === 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
            <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Rankings Yet</h3>
            <p className="text-slate-400 mb-6">Be the first to complete a level and claim your spot!</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              Go to Dashboard
              <Star className="w-5 h-5" />
            </Link>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">Error Loading Leaderboard</h3>
              <p className="text-red-200">{error}</p>
            </div>
            <button
              onClick={fetchLeaderboard}
              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Podium Card Component
const PodiumCard = ({ entry, rank, isCurrentUser, isFirst = false }) => {
  const config = getMedalConfig(rank);
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className={`relative transition-all duration-300 ${
        isFirst ? 'md:-mt-8 scale-105' : ''
      } ${isCurrentUser ? 'ring-4 ring-blue-500 ring-offset-4 ring-offset-slate-900' : ''}`}
    >
      <div className={`bg-gradient-to-br ${config.color} rounded-t-xl p-4 text-center`}>
        <Icon className="w-12 h-12 text-white mx-auto mb-2" />
        <div className="text-white text-4xl font-bold mb-1">{config.emoji}</div>
        <div className="text-white/90 text-sm font-medium">Rank #{rank}</div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg border-x border-b border-white/20 rounded-b-xl p-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {entry.username?.charAt(0).toUpperCase()}
          </div>
        </div>

        <h3 className="text-xl font-bold text-white text-center mb-1">
          {entry.username}
        </h3>
        {isCurrentUser && (
          <div className="flex justify-center mb-3">
            <span className="px-3 py-1 bg-blue-500/30 text-blue-300 text-sm rounded-full border border-blue-500/50">
              You
            </span>
          </div>
        )}

        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Total Score</span>
            <span className="text-white font-bold text-lg">{entry.totalScore?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Levels Completed</span>
            <span className="text-white font-medium">{entry.levelsCompleted || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Accuracy</span>
            <span className="text-green-400 font-medium">
              {entry.accuracy ? `${Math.round(entry.accuracy)}%` : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function
const getMedalConfig = (rank) => {
  if (rank === 1) return {
    icon: Crown,
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    textColor: 'text-yellow-400',
    emoji: '🥇'
  };
  if (rank === 2) return {
    icon: Medal,
    color: 'from-gray-300 to-gray-500',
    bgColor: 'bg-gray-400/20',
    borderColor: 'border-gray-400/50',
    textColor: 'text-gray-300',
    emoji: '🥈'
  };
  if (rank === 3) return {
    icon: Award,
    color: 'from-orange-400 to-orange-600',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/50',
    textColor: 'text-orange-400',
    emoji: '🥉'
  };
  return null;
};

export default Leaderboard;
