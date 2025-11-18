import React, { useState } from 'react';
import theme from '../../styles/theme';

/**
 * Tooltip Component
 *
 * Shows helpful text on hover
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Element to attach tooltip to
 * @param {string} props.text - Tooltip text
 * @param {string} props.position - Tooltip position (top, bottom, left, right)
 * @param {string} props.className - Additional CSS classes
 */
const Tooltip = ({
  children,
  text,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!text) return children;

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`${theme.components.tooltip.base} ${positionClasses[position]} ${className}`}
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
