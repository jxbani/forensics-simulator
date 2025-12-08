/**
 * Design System Theme
 *
 * Centralized design tokens for consistent styling across the application.
 * Use these tokens instead of hardcoding values to maintain design consistency.
 */

export const theme = {
  // Color palette
  colors: {
    // Background gradients and solid colors
    background: {
      gradient: 'from-slate-900 via-blue-900 to-slate-900',
      primary: 'bg-slate-900',
      secondary: 'bg-slate-800',
      tertiary: 'bg-slate-700',
      hover: 'hover:bg-slate-700',
      card: 'bg-white/10',
      cardHover: 'hover:bg-white/15',
    },

    // Border colors
    border: {
      primary: 'border-white/20',
      secondary: 'border-slate-700',
      tertiary: 'border-slate-600',
      hover: 'hover:border-slate-500',
      active: 'border-blue-500',
      activeHover: 'hover:border-blue-400',
      error: 'border-red-500',
      success: 'border-green-500',
      warning: 'border-yellow-500',
    },

    // Text colors
    text: {
      primary: 'text-white',
      secondary: 'text-slate-300',
      tertiary: 'text-slate-400',
      muted: 'text-slate-500',
      accent: 'text-blue-400',
      accentHover: 'hover:text-blue-300',
      error: 'text-red-400',
      success: 'text-green-400',
      warning: 'text-yellow-400',
    },

    // Button colors
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
      primaryText: 'text-white',
      secondary: 'bg-slate-700 hover:bg-slate-600 active:bg-slate-500',
      secondaryText: 'text-white',
      danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800',
      dangerText: 'text-white',
      success: 'bg-green-600 hover:bg-green-700 active:bg-green-800',
      successText: 'text-white',
      ghost: 'bg-transparent hover:bg-white/10 active:bg-white/20',
      ghostText: 'text-slate-300 hover:text-white',
      disabled: 'bg-slate-600 cursor-not-allowed',
      disabledText: 'text-slate-400',
    },

    // Status colors
    status: {
      info: 'bg-blue-500/10 border-blue-500/30 text-blue-200',
      success: 'bg-green-500/10 border-green-500/30 text-green-200',
      warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200',
      error: 'bg-red-500/10 border-red-500/30 text-red-200',
    },

    // Badge colors
    badge: {
      blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      green: 'bg-green-500/20 text-green-300 border-green-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      red: 'bg-red-500/20 text-red-300 border-red-500/30',
      purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      gray: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    },
  },

  // Spacing
  spacing: {
    // Container widths
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    containerNarrow: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
    containerWide: 'max-w-full mx-auto px-4 sm:px-6 lg:px-8',

    // Section spacing
    section: 'mb-8',
    sectionTight: 'mb-4',
    sectionLoose: 'mb-12',

    // Card padding
    card: 'p-6',
    cardTight: 'p-4',
    cardLoose: 'p-8',

    // Page padding
    page: 'py-8',
    pageTight: 'py-4',
    pageLoose: 'py-12',
  },

  // Typography
  typography: {
    // Headings
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-bold',
    h4: 'text-xl font-semibold',
    h5: 'text-lg font-semibold',
    h6: 'text-base font-semibold',

    // Body text
    body: 'text-base',
    bodyLarge: 'text-lg',
    bodySmall: 'text-sm',

    // Special text
    caption: 'text-xs',
    code: 'font-mono text-sm',
    link: 'text-blue-400 hover:text-blue-300 underline cursor-pointer',
  },

  // Shadows
  shadows: {
    none: 'shadow-none',
    sm: 'shadow-sm',
    default: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    inner: 'shadow-inner',
  },

  // Rounded corners
  rounded: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    default: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  },

  // Transitions
  transitions: {
    fast: 'transition-all duration-150 ease-in-out',
    default: 'transition-all duration-200 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out',
    colors: 'transition-colors duration-200 ease-in-out',
    transform: 'transition-transform duration-200 ease-in-out',
  },

  // Effects
  effects: {
    // Backdrop blur (glass morphism)
    glass: 'backdrop-blur-lg bg-white/10',
    glassStrong: 'backdrop-blur-xl bg-white/15',

    // Hover effects
    hoverLift: 'hover:transform hover:scale-105 hover:shadow-2xl',
    hoverLiftSmall: 'hover:transform hover:scale-102 hover:shadow-lg',

    // Active/pressed effects
    pressEffect: 'active:transform active:scale-95',

    // Loading pulse
    pulse: 'animate-pulse',
    spin: 'animate-spin',

    // Focus effects
    focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900',
    focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  },

  // Component styles (composable)
  components: {
    // Card styles
    card: {
      base: 'bg-white/10 backdrop-blur-lg rounded-lg shadow-xl border border-white/20',
      hover: 'hover:bg-white/15 hover:shadow-2xl transition-all duration-200',
      padding: 'p-6',
    },

    // Button styles
    button: {
      base: 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed',
      sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },

    // Input styles
    input: {
      base: 'block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
      error: 'border-red-500 focus:ring-red-500',
    },

    // Badge styles
    badge: {
      base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
    },

    // Alert/Banner styles
    alert: {
      base: 'rounded-lg p-4 flex items-start gap-3 border',
    },

    // Modal styles
    modal: {
      overlay: 'fixed inset-0 bg-black/70 backdrop-blur-sm z-40',
      content: 'fixed inset-0 flex items-center justify-center p-4 z-50',
      panel: 'bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto',
    },

    // Tooltip styles
    tooltip: {
      base: 'absolute z-50 px-2 py-1 text-xs text-white bg-slate-900 rounded shadow-lg border border-white/20 whitespace-nowrap',
    },
  },

  // Animations (for use with keyframes)
  animations: {
    fadeIn: 'animate-in fade-in duration-300',
    fadeOut: 'animate-out fade-out duration-200',
    slideInFromTop: 'animate-in slide-in-from-top duration-300',
    slideInFromBottom: 'animate-in slide-in-from-bottom duration-300',
    slideInFromLeft: 'animate-in slide-in-from-left duration-300',
    slideInFromRight: 'animate-in slide-in-from-right duration-300',
    scaleIn: 'animate-in zoom-in duration-200',
    scaleOut: 'animate-out zoom-out duration-200',
  },
};

/**
 * Helper function to combine theme classes
 * @param {...string} classes - Class names to combine
 * @returns {string} Combined class string
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Get button classes based on variant and size
 * @param {string} variant - Button variant (primary, secondary, danger, success, ghost)
 * @param {string} size - Button size (sm, md, lg)
 * @param {boolean} disabled - Whether button is disabled
 * @returns {string} Combined button classes
 */
export const getButtonClasses = (variant = 'primary', size = 'md', disabled = false) => {
  const base = theme.components.button.base;
  const sizeClass = theme.components.button.sizes[size];

  let variantClasses = '';
  if (disabled) {
    variantClasses = `${theme.colors.button.disabled} ${theme.colors.button.disabledText}`;
  } else {
    switch (variant) {
      case 'primary':
        variantClasses = `${theme.colors.button.primary} ${theme.colors.button.primaryText} focus:ring-blue-500`;
        break;
      case 'secondary':
        variantClasses = `${theme.colors.button.secondary} ${theme.colors.button.secondaryText} focus:ring-slate-500`;
        break;
      case 'danger':
        variantClasses = `${theme.colors.button.danger} ${theme.colors.button.dangerText} focus:ring-red-500`;
        break;
      case 'success':
        variantClasses = `${theme.colors.button.success} ${theme.colors.button.successText} focus:ring-green-500`;
        break;
      case 'ghost':
        variantClasses = `${theme.colors.button.ghost} ${theme.colors.button.ghostText} focus:ring-slate-500`;
        break;
      default:
        variantClasses = `${theme.colors.button.primary} ${theme.colors.button.primaryText} focus:ring-blue-500`;
    }
  }

  return cn(base, sizeClass, variantClasses, theme.effects.pressEffect);
};

/**
 * Get card classes
 * @param {boolean} hoverable - Whether card should have hover effects
 * @returns {string} Combined card classes
 */
export const getCardClasses = (hoverable = false) => {
  const base = theme.components.card.base;
  const padding = theme.components.card.padding;
  const hover = hoverable ? theme.components.card.hover : '';

  return cn(base, padding, hover);
};

/**
 * Get input classes
 * @param {boolean} hasError - Whether input has an error
 * @returns {string} Combined input classes
 */
export const getInputClasses = (hasError = false) => {
  const base = theme.components.input.base;
  const error = hasError ? theme.components.input.error : '';

  return cn(base, error);
};

/**
 * Get badge classes
 * @param {string} color - Badge color variant
 * @returns {string} Combined badge classes
 */
export const getBadgeClasses = (color = 'blue') => {
  const base = theme.components.badge.base;
  const colorClass = theme.colors.badge[color] || theme.colors.badge.blue;

  return cn(base, colorClass);
};

/**
 * Get alert classes
 * @param {string} variant - Alert variant (info, success, warning, error)
 * @returns {string} Combined alert classes
 */
export const getAlertClasses = (variant = 'info') => {
  const base = theme.components.alert.base;
  const variantClass = theme.colors.status[variant] || theme.colors.status.info;

  return cn(base, variantClass);
};

export default theme;
