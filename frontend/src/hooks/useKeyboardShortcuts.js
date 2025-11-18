import { useEffect, useCallback } from 'react';

/**
 * useKeyboardShortcuts - Custom hook to handle keyboard shortcuts
 * @param {Object} shortcuts - Object mapping key combinations to callback functions
 * @param {boolean} enabled - Whether shortcuts are enabled (default: true)
 *
 * @example
 * useKeyboardShortcuts({
 *   'ctrl+k': () => console.log('Ctrl+K pressed'),
 *   'escape': () => console.log('Escape pressed'),
 *   '?': () => console.log('? pressed')
 * });
 */
const useKeyboardShortcuts = (shortcuts, enabled = true) => {
  /**
   * Check if the target element is an input field
   * Prevents shortcuts from firing when typing in input fields
   */
  const isInputElement = (element) => {
    const tagName = element.tagName.toLowerCase();
    const isContentEditable = element.contentEditable === 'true';

    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      isContentEditable
    );
  };

  /**
   * Parse keyboard event to shortcut string
   * @param {KeyboardEvent} event
   * @returns {string} - Shortcut string (e.g., 'ctrl+k', 'alt+shift+s')
   */
  const getShortcutString = useCallback((event) => {
    const parts = [];

    // Add modifiers in consistent order
    if (event.ctrlKey || event.metaKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');

    // Add the main key (lowercase)
    const key = event.key.toLowerCase();

    // Don't add modifier keys themselves
    if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
      parts.push(key);
    }

    return parts.join('+');
  }, []);

  /**
   * Handle keyboard event
   */
  const handleKeyDown = useCallback((event) => {
    // Don't handle shortcuts if disabled
    if (!enabled) return;

    // Don't handle shortcuts when typing in input fields
    // Exception: Allow Escape key to work everywhere
    if (isInputElement(event.target) && event.key !== 'Escape') {
      return;
    }

    // Get the shortcut string
    const shortcutString = getShortcutString(event);

    // Check if this shortcut is registered
    const callback = shortcuts[shortcutString];

    if (callback) {
      // Prevent default browser behavior for this shortcut
      event.preventDefault();
      event.stopPropagation();

      // Execute the callback
      callback(event);
    }
  }, [enabled, shortcuts, getShortcutString]);

  /**
   * Set up event listener
   */
  useEffect(() => {
    if (!enabled) return;

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  /**
   * Return helper function to format shortcut for display
   */
  const formatShortcut = useCallback((shortcut) => {
    const parts = shortcut.split('+');

    return parts.map(part => {
      // Capitalize and format for display
      switch (part.toLowerCase()) {
        case 'ctrl':
          return navigator.platform.includes('Mac') ? '⌘' : 'Ctrl';
        case 'alt':
          return navigator.platform.includes('Mac') ? '⌥' : 'Alt';
        case 'shift':
          return navigator.platform.includes('Mac') ? '⇧' : 'Shift';
        case 'escape':
          return 'Esc';
        case 'arrowup':
          return '↑';
        case 'arrowdown':
          return '↓';
        case 'arrowleft':
          return '←';
        case 'arrowright':
          return '→';
        case ' ':
          return 'Space';
        default:
          return part.toUpperCase();
      }
    });
  }, []);

  return { formatShortcut };
};

export default useKeyboardShortcuts;
