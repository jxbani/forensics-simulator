import React from 'react';
import { getCardClasses } from '../../styles/theme';

/**
 * Card Component
 *
 * Consistent card component with optional hover effects
 *
 * @param {Object} props
 * @param {boolean} props.hoverable - Whether card should have hover effects
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 */
const Card = ({
  hoverable = false,
  children,
  className = '',
  onClick,
  ...props
}) => {
  const cardClasses = getCardClasses(hoverable);

  return (
    <div
      className={`${cardClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
