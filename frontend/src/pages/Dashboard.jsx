import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Trophy, Target, CheckCircle2, Zap, Lock, Unlock, Star,
  TrendingUp, Award, Flame, ChevronRight, Loader2, AlertCircle,
  BarChart3, BookOpen, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import levelService from '../services/levelService';
import progressService from '../services/progressService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [levels, setLevels] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch levels and progress in parallel
      const [levelsData, progressData] = await Promise.all([
        levelService.getAllLevels(),
        progressService.getUserProgress(),
      ]);

      setLevels(levelsData.levels || []);
      setStats(progressData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDifficultyConfig = (difficulty) => {
    const configs = {
      BEGINNER: {
        color: 'from-green-500 to-emerald-600',
        textColor: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        icon: '⭐',
        label: 'Beginner'
      },
      INTERMEDIATE: {
        color: 'from-yellow-500 to-orange-600',
        textColor: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        icon: '⭐⭐',
        label: 'Intermediate'
      },
      ADVANCED: {
        color: 'from-red-500 to-pink-600',
        textColor: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        icon: '⭐⭐⭐',
        label: 'Advanced'
      },
      EXPERT: {
        color: 'from-purple-500 to-indigo-600',
        textColor: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        icon: '🏆',
        label: 'Expert'
      },
    };
    return configs[difficulty] || configs.BEGINNER;
  };

  const isLevelLocked = (level) => {
    // Level 1 is always unlocked
    if (level.orderIndex === 1) return false;

    // Check if previous level is completed
    const previousLevel = levels.find(l => l.orderIndex === level.orderIndex - 1);
    if (!previousLevel) return true;

    return !previousLevel.userProgress?.completedAt;
  };

  const calculateOverallProgress = () => {
    if (!stats || !levels.length) return 0;
    const completed = stats.completedLevels || 0;
    const total = levels.length;
    return Math.round((completed / total) * 100);
  };

  const getNextLevel = () => {
    return levels.find(level => !level.userProgress?.completedAt && !isLevelLocked(level));
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-white/10 rounded-2xl h-32 mb-8"></div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white/10 rounded-xl h-32"></div>
              ))}
            </div>

            {/* Levels Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white/10 rounded-xl h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const nextLevel = getNextLevel();
  const overallProgress = calculateOverallProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Digital Forensics Simulator</h1>
                <p className="text-slate-300 text-sm">Welcome back, {user?.username}!</p>
              </div>
            </div>

            <nav className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg font-medium border border-blue-500/30"
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
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all"
              >
                Leaderboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Score */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats?.totalScore || 0}</h3>
            <p className="text-slate-400 text-sm">Total Score</p>
          </div>

          {/* Levels Completed */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {stats?.completedLevels || 0}<span className="text-lg text-slate-400">/{levels.length}</span>
            </h3>
            <p className="text-slate-400 text-sm">Levels Completed</p>
          </div>

          {/* Accuracy */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats?.accuracy || 0}%</h3>
            <p className="text-slate-400 text-sm">Accuracy Rate</p>
          </div>

          {/* Rank */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">#{stats?.rank || '--'}</h3>
            <p className="text-slate-400 text-sm">Global Rank</p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Overall Progress</h2>
              <p className="text-slate-400 text-sm">Complete all levels to master digital forensics</p>
            </div>
            <div className="text-3xl font-bold text-white">{overallProgress}%</div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${overallProgress}%` }}
            >
              {overallProgress > 10 && (
                <span className="text-xs font-medium text-white">{overallProgress}%</span>
              )}
            </div>
          </div>
        </div>

        {/* Next Challenge Card */}
        {nextLevel && (
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-lg rounded-xl p-6 border-2 border-blue-500/30 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Next Challenge</h3>
                <p className="text-blue-200 font-medium">{nextLevel.title}</p>
                <p className="text-slate-300 text-sm">{nextLevel.description}</p>
              </div>
              <button
                onClick={() => navigate(`/level/${nextLevel.id}`)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg"
              >
                Start Now
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Levels Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <BookOpen className="w-7 h-7" />
            Training Levels
          </h2>
          <p className="text-slate-400">Select a level to begin your forensics training</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => {
            const locked = isLevelLocked(level);
            const completed = level.userProgress?.completedAt;
            const score = level.userProgress?.score || 0;
            const difficulty = getDifficultyConfig(level.difficulty);

            return (
              <div
                key={level.id}
                className={`bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden transition-all duration-300 ${
                  locked
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:bg-white/15 hover:scale-105 hover:shadow-2xl cursor-pointer'
                }`}
                onClick={() => !locked && navigate(`/level/${level.id}`)}
              >
                {/* Card Header */}
                <div className={`p-4 bg-gradient-to-r ${difficulty.color} relative`}>
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 text-sm font-medium">
                      {difficulty.icon} {difficulty.label}
                    </span>
                    {locked && <Lock className="w-5 h-5 text-white/80" />}
                    {!locked && !completed && <Unlock className="w-5 h-5 text-white/80" />}
                    {completed && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-slate-400 text-sm mb-1">Level {level.orderIndex}</div>
                      <h3 className="text-xl font-bold text-white mb-2">{level.title}</h3>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">{level.description}</p>

                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {level.taskCount || 0} Tasks
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {level.maxScore || 0} Points
                    </span>
                  </div>

                  {completed && score > 0 && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-300 font-medium">Your Score:</span>
                        <span className="text-green-400 font-bold">{score} points</span>
                      </div>
                    </div>
                  )}

                  {!locked && (
                    <button
                      className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        completed
                          ? 'bg-slate-600 text-white hover:bg-slate-500'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg'
                      }`}
                    >
                      {completed ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Review Level
                        </>
                      ) : (
                        <>
                          <Star className="w-5 h-5" />
                          Start Level
                        </>
                      )}
                    </button>
                  )}

                  {locked && (
                    <div className="w-full py-3 bg-slate-700/50 rounded-lg font-medium text-slate-400 flex items-center justify-center gap-2">
                      <Lock className="w-5 h-5" />
                      Complete Previous Level
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {levels.length === 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Levels Available</h3>
            <p className="text-slate-400">Check back later for new training content</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
