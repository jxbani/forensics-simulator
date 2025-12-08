import React from 'react';
import PropTypes from 'prop-types';

/**
 * EmptyState - Reusable component for displaying empty states
 * Shows when there's no data to display with helpful messaging and actions
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = 'default',
  size = 'medium',
  animated = true
}) => {
  // Variant color schemes
  const variants = {
    default: {
      iconBg: 'bg-gray-100 dark:bg-gray-800',
      iconColor: 'text-gray-400 dark:text-gray-500',
      titleColor: 'text-gray-900 dark:text-gray-100',
      descColor: 'text-gray-600 dark:text-gray-400',
      primaryBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      secondaryBtn: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
    },
    primary: {
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      titleColor: 'text-gray-900 dark:text-gray-100',
      descColor: 'text-gray-600 dark:text-gray-400',
      primaryBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      secondaryBtn: 'bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
    },
    success: {
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      titleColor: 'text-gray-900 dark:text-gray-100',
      descColor: 'text-gray-600 dark:text-gray-400',
      primaryBtn: 'bg-green-600 hover:bg-green-700 text-white',
      secondaryBtn: 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300'
    },
    warning: {
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      titleColor: 'text-gray-900 dark:text-gray-100',
      descColor: 'text-gray-600 dark:text-gray-400',
      primaryBtn: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      secondaryBtn: 'bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
    },
    info: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      titleColor: 'text-gray-900 dark:text-gray-100',
      descColor: 'text-gray-600 dark:text-gray-400',
      primaryBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondaryBtn: 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300'
    }
  };

  // Size configurations
  const sizes = {
    small: {
      container: 'py-6',
      iconContainer: 'w-12 h-12 mb-3',
      iconSize: 'w-6 h-6',
      title: 'text-base',
      description: 'text-sm',
      button: 'px-4 py-2 text-sm',
      buttonIcon: 'w-4 h-4'
    },
    medium: {
      container: 'py-12',
      iconContainer: 'w-16 h-16 mb-4',
      iconSize: 'w-8 h-8',
      title: 'text-lg',
      description: 'text-sm',
      button: 'px-6 py-3 text-base',
      buttonIcon: 'w-5 h-5'
    },
    large: {
      container: 'py-16',
      iconContainer: 'w-24 h-24 mb-6',
      iconSize: 'w-12 h-12',
      title: 'text-2xl',
      description: 'text-base',
      button: 'px-8 py-4 text-lg',
      buttonIcon: 'w-6 h-6'
    }
  };

  const colors = variants[variant] || variants.default;
  const sizing = sizes[size] || sizes.medium;

  return (
    <div
      className={`
        text-center ${sizing.container}
        ${animated ? 'animate-fade-in' : ''}
      `}
    >
      {/* Icon */}
      {Icon && (
        <div
          className={`
            ${sizing.iconContainer} ${colors.iconBg}
            rounded-full flex items-center justify-center mx-auto
            ${animated ? 'animate-zoom-in' : ''}
          `}
          style={animated ? { animationDelay: '150ms' } : {}}
        >
          <Icon className={`${sizing.iconSize} ${colors.iconColor}`} />
        </div>
      )}

      {/* Title */}
      {title && (
        <h3
          className={`
            ${sizing.title} font-semibold ${colors.titleColor} mb-2
            ${animated ? 'animate-slide-in-from-bottom-2' : ''}
          `}
          style={animated ? { animationDelay: '300ms' } : {}}
        >
          {title}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p
          className={`
            ${sizing.description} ${colors.descColor} max-w-md mx-auto mb-6
            ${animated ? 'animate-slide-in-from-bottom-2' : ''}
          `}
          style={animated ? { animationDelay: '400ms' } : {}}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <div
          className={`
            flex items-center justify-center gap-3 flex-wrap
            ${animated ? 'animate-slide-in-from-bottom-2' : ''}
          `}
          style={animated ? { animationDelay: '500ms' } : {}}
        >
          {/* Primary Action */}
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className={`
                ${sizing.button} ${colors.primaryBtn}
                rounded-lg font-medium
                flex items-center gap-2
                transition-all duration-200
                hover:shadow-lg hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              `}
            >
              {ActionIcon && <ActionIcon className={sizing.buttonIcon} />}
              {actionLabel}
            </button>
          )}

          {/* Secondary Action */}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className={`
                ${sizing.button} ${colors.secondaryBtn}
                rounded-lg font-medium
                flex items-center gap-2
                transition-all duration-200
                hover:shadow-md hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
              `}
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  actionLabel: PropTypes.string,
  actionIcon: PropTypes.elementType,
  onAction: PropTypes.func,
  secondaryActionLabel: PropTypes.string,
  onSecondaryAction: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'info']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  animated: PropTypes.bool
};

export default EmptyState;
