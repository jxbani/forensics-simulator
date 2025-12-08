import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { getAlertClasses } from '../../styles/theme';

/**
 * Alert Component
 *
 * Consistent alert/banner component for messages
 *
 * @param {Object} props
 * @param {string} props.variant - Alert variant (info, success, warning, error)
 * @param {string} props.title - Alert title
 * @param {string} props.message - Alert message
 * @param {React.ReactNode} props.children - Alert content (alternative to message)
 * @param {boolean} props.dismissible - Whether alert can be dismissed
 * @param {Function} props.onDismiss - Dismiss handler
 * @param {string} props.className - Additional CSS classes
 */
const Alert = ({
  variant = 'info',
  title,
  message,
  children,
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const alertClasses = getAlertClasses(variant);

  const icons = {
    info: <Info className="w-5 h-5 flex-shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
  };

  return (
    <div className={`${alertClasses} ${className}`}>
      {icons[variant]}
      <div className="flex-1">
        {title && <div className="font-semibold mb-1">{title}</div>}
        {message && <div className="text-sm">{message}</div>}
        {children}
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="text-current hover:opacity-70 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;
