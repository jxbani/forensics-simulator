import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Toast - Notification component for displaying temporary messages
 * @param {string} id - Unique identifier for the toast
 * @param {string} type - Type of toast (success, error, warning, info)
 * @param {string} title - Toast title/heading
 * @param {string} message - Toast message content
 * @param {number} duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
 * @param {function} onClose - Callback when toast is closed
 */
const Toast = ({ id, type = 'info', title, message, duration = 5000, onClose }) => {
  // Auto-dismiss after duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  // Get icon and colors based on type
  const getToastConfig = () => {
    const configs = {
      success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        iconColor: 'text-green-600 dark:text-green-400',
        titleColor: 'text-green-900 dark:text-green-100',
        messageColor: 'text-green-800 dark:text-green-200',
        progressColor: 'bg-green-600 dark:bg-green-500'
      },
      error: {
        icon: XCircle,
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        iconColor: 'text-red-600 dark:text-red-400',
        titleColor: 'text-red-900 dark:text-red-100',
        messageColor: 'text-red-800 dark:text-red-200',
        progressColor: 'bg-red-600 dark:bg-red-500'
      },
      warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        titleColor: 'text-yellow-900 dark:text-yellow-100',
        messageColor: 'text-yellow-800 dark:text-yellow-200',
        progressColor: 'bg-yellow-600 dark:bg-yellow-500'
      },
      info: {
        icon: Info,
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        iconColor: 'text-blue-600 dark:text-blue-400',
        titleColor: 'text-blue-900 dark:text-blue-100',
        messageColor: 'text-blue-800 dark:text-blue-200',
        progressColor: 'bg-blue-600 dark:bg-blue-500'
      }
    };

    return configs[type] || configs.info;
  };

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <div
      className={`
        ${config.bgColor} ${config.borderColor}
        border rounded-lg shadow-lg p-4 mb-3 min-w-[320px] max-w-md
        animate-slide-in-from-bottom-2
        transition-all duration-300 hover:shadow-xl
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
              {title}
            </h3>
          )}
          {message && (
            <p className={`text-sm ${config.messageColor}`}>
              {message}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onClose(id)}
          className={`
            flex-shrink-0 ${config.iconColor}
            hover:opacity-70 transition-opacity
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type}-500
            rounded
          `}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${config.progressColor} animate-shrink-width`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  );
};

Toast.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  title: PropTypes.string,
  message: PropTypes.string,
  duration: PropTypes.number,
  onClose: PropTypes.func.isRequired
};

/**
 * ToastContainer - Container for managing multiple toast notifications
 * @param {Array} toasts - Array of toast objects
 * @param {function} onClose - Callback when a toast is closed
 */
export const ToastContainer = ({ toasts = [], onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex flex-col items-end pointer-events-auto">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
      title: PropTypes.string,
      message: PropTypes.string,
      duration: PropTypes.number
    })
  ),
  onClose: PropTypes.func.isRequired
};

export default Toast;
