import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Trophy, Microscope, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Header - Shared navigation header component
 * Provides navigation links and user actions
 */
const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <h1 className="text-xl font-bold text-white hover:text-slate-200 transition-colors">
                Digital Forensics Simulator
              </h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              to="/forensic-lab"
              className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              <Microscope className="w-4 h-4" />
              Forensic Lab
            </Link>

            <Link
              to="/leaderboard"
              className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Link>

            {/* User Info & Logout */}
            {user && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-600">
                <span className="text-slate-300 text-sm">
                  {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
