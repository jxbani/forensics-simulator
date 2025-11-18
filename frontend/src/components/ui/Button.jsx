import React from 'react';
import { Loader2 } from 'lucide-react';
import { getButtonClasses } from '../../styles/theme';

/**
 * Button Component
 *
 * Consistent button component with loading and disabled states
 *
 * @param {Object} props
 * @param {string} props.variant - Button variant (primary, secondary, danger, success, ghost)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {React.ReactNode} props.children - Button content
 * @param {React.ReactNode} props.leftIcon - Icon to display on left
 * @param {React.ReactNode} props.rightIcon - Icon to display on right
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 * @param {string} props.type - Button type (button, submit, reset)
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading;
  const buttonClasses = getButtonClasses(variant, size, isDisabled);

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${buttonClasses} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && leftIcon && leftIcon}
      {children}
      {!loading && rightIcon && rightIcon}
    </button>
  );
};

export default Button;
