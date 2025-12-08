import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Keyboard, Upload, RefreshCw, Search, Zap, HelpCircle } from 'lucide-react';

/**
 * Keyboard shortcuts database
 */
const SHORTCUTS = {
  files: [
    {
      keys: ['Ctrl', 'U'],
      macKeys: ['⌘', 'U'],
      description: 'Open file upload dialog',
      icon: Upload
    },
    {
      keys: ['Ctrl', 'R'],
      macKeys: ['⌘', 'R'],
      description: 'Refresh container list',
      icon: RefreshCw
    }
  ],
  navigation: [
    {
      keys: ['Ctrl', 'K'],
      macKeys: ['⌘', 'K'],
      description: 'Focus search/filter',
      icon: Search
    },
    {
      keys: ['Ctrl', 'D'],
      macKeys: ['⌘', 'D'],
      description: 'Toggle dark mode',
      icon: Zap
    },
    {
      keys: ['Esc'],
      macKeys: ['Esc'],
      description: 'Close modals and dialogs',
      icon: X
    }
  ],
  tools: [
    {
      keys: ['1'],
      macKeys: ['1'],
      description: 'Quick select Volatility',
      icon: null
    },
    {
      keys: ['2'],
      macKeys: ['2'],
      description: 'Quick select Wireshark',
      icon: null
    },
    {
      keys: ['3'],
      macKeys: ['3'],
      description: 'Quick select Autopsy',
      icon: null
    },
    {
      keys: ['4'],
      macKeys: ['4'],
      description: 'Quick select FTK Imager',
      icon: null
    }
  ],
  help: [
    {
      keys: ['Ctrl', 'H'],
      macKeys: ['⌘', 'H'],
      description: 'Show keyboard shortcuts',
      icon: HelpCircle
    },
    {
      keys: ['?'],
      macKeys: ['?'],
      description: 'Show keyboard shortcuts',
      icon: HelpCircle
    }
  ]
};

/**
 * KeyboardKey - Component for displaying a single keyboard key
 */
const KeyboardKey = ({ keyLabel }) => {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 font-mono text-sm font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
      {keyLabel}
    </kbd>
  );
};

KeyboardKey.propTypes = {
  keyLabel: PropTypes.string.isRequired
};

/**
 * ShortcutRow - Component for displaying a shortcut row
 */
const ShortcutRow = ({ shortcut, isMac }) => {
  const Icon = shortcut.icon;
  const keys = isMac ? shortcut.macKeys : shortcut.keys;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {shortcut.description}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-gray-400 dark:text-gray-500 mx-1">+</span>
            )}
            <KeyboardKey keyLabel={key} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

ShortcutRow.propTypes = {
  shortcut: PropTypes.shape({
    keys: PropTypes.arrayOf(PropTypes.string).isRequired,
    macKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.elementType
  }).isRequired,
  isMac: PropTypes.bool.isRequired
};

/**
 * KeyboardShortcutsPanel - Modal panel showing all keyboard shortcuts
 */
const KeyboardShortcutsPanel = ({ isOpen, onClose }) => {
  const isMac = navigator.platform.includes('Mac');

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      // Find all focusable elements
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 0) {
        // Focus the close button
        const closeButton = document.querySelector('[data-shortcuts-close]');
        if (closeButton) {
          closeButton.focus();
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      {/* Modal Content */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Keyboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 id="shortcuts-title" className="text-2xl font-bold text-white">
                  Keyboard Shortcuts
                </h2>
                <p className="text-indigo-100 text-sm">
                  Navigate faster with these keyboard shortcuts
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              data-shortcuts-close
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close keyboard shortcuts panel"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Files Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              File Operations
            </h3>
            <div className="space-y-2">
              {SHORTCUTS.files.map((shortcut, index) => (
                <ShortcutRow key={index} shortcut={shortcut} isMac={isMac} />
              ))}
            </div>
          </section>

          {/* Navigation Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Navigation
            </h3>
            <div className="space-y-2">
              {SHORTCUTS.navigation.map((shortcut, index) => (
                <ShortcutRow key={index} shortcut={shortcut} isMac={isMac} />
              ))}
            </div>
          </section>

          {/* Tools Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Quick Tool Selection
            </h3>
            <div className="space-y-2">
              {SHORTCUTS.tools.map((shortcut, index) => (
                <ShortcutRow key={index} shortcut={shortcut} isMac={isMac} />
              ))}
            </div>
          </section>

          {/* Help Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Help
            </h3>
            <div className="space-y-2">
              {SHORTCUTS.help.map((shortcut, index) => (
                <ShortcutRow key={index} shortcut={shortcut} isMac={isMac} />
              ))}
            </div>
          </section>

          {/* Tips */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Pro Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Shortcuts work from anywhere in the Forensic Lab</li>
              <li>• Press <kbd className="px-1 py-0.5 bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-700 rounded text-xs">Esc</kbd> to close any modal or dialog</li>
              <li>• Number keys (1-4) quickly select tools when not typing</li>
              <li>• All shortcuts are disabled when typing in input fields</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

KeyboardShortcutsPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default KeyboardShortcutsPanel;
