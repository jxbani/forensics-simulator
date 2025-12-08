import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingSpinner Component
 *
 * Consistent loading spinner for page and component loading states
 *
 * @param {Object} props
 * @param {string} props.size - Spinner size (sm, md, lg)
 * @param {string} props.text - Optional loading text
 * @param {boolean} props.fullScreen - Whether to show full screen loading
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSpinner = ({
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.md;

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className={`${spinnerSize} text-blue-400 animate-spin mx-auto mb-4`} />
          {text && <p className="text-white text-lg">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${spinnerSize} text-blue-400 animate-spin`} />
      {text && <span className="text-slate-300">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
