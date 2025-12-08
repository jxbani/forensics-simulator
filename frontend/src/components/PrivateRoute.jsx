import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 * Shows beautiful loading spinner while checking authentication
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-2xl">
            <Shield className="w-10 h-10 text-white animate-pulse" />
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="text-xl font-medium text-white">Loading...</span>
          </div>
          <p className="text-slate-400">
            Verifying authentication
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  // Save the attempted location to redirect back after login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render the protected component
  return children;
};

export default PrivateRoute;
