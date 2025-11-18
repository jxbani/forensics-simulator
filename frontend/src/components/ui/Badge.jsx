import React from 'react';
import { getBadgeClasses } from '../../styles/theme';

/**
 * Badge Component
 *
 * Small label for displaying tags, statuses, etc.
 *
 * @param {Object} props
 * @param {string} props.color - Badge color (blue, green, yellow, red, purple, gray)
 * @param {React.ReactNode} props.children - Badge content
 * @param {React.ReactNode} props.icon - Optional icon
 * @param {string} props.className - Additional CSS classes
 */
const Badge = ({
  color = 'blue',
  children,
  icon,
  className = '',
}) => {
  const badgeClasses = getBadgeClasses(color);

  return (
    <span className={`${badgeClasses} ${className}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
