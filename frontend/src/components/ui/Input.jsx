import React from 'react';
import { getInputClasses } from '../../styles/theme';

/**
 * Input Component
 *
 * Consistent input field with error state
 *
 * @param {Object} props
 * @param {string} props.type - Input type
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.error - Whether input has an error
 * @param {string} props.errorMessage - Error message to display
 * @param {string} props.label - Input label
 * @param {boolean} props.required - Whether input is required
 * @param {React.ReactNode} props.leftIcon - Icon to display on left
 * @param {React.ReactNode} props.rightElement - Element to display on right (e.g., button)
 * @param {string} props.className - Additional CSS classes
 */
const Input = React.forwardRef(({
  type = 'text',
  value,
  onChange,
  placeholder,
  error = false,
  errorMessage,
  label,
  required = false,
  leftIcon,
  rightElement,
  className = '',
  ...props
}, ref) => {
  const inputClasses = getInputClasses(error);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-200 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputClasses} ${leftIcon ? 'pl-10' : ''} ${rightElement ? 'pr-12' : ''}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && errorMessage && (
        <p className="mt-2 text-sm text-red-400">{errorMessage}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
