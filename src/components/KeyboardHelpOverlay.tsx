import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Keyboard Help Overlay Component
 * 
 * Displays available keyboard shortcuts to the user.
 * 
 * Requirements:
 * - 10.4: Help overlay showing available keys
 */

interface KeyboardHelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardHelpOverlay = ({ isOpen, onClose }: KeyboardHelpOverlayProps) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-900 border-2 border-reinvent-purple rounded-lg p-8 max-w-2xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close help overlay"
            >
              <X size={24} />
            </button>

            {/* Title */}
            <h2 className="text-3xl font-bold text-white mb-6">
              Keyboard Shortcuts
            </h2>

            {/* Shortcuts List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                <span className="text-gray-300 text-lg">Navigate forward</span>
                <kbd className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-600 font-mono text-sm">
                  →
                </kbd>
              </div>

              <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                <span className="text-gray-300 text-lg">Select answer (Quiz slides)</span>
                <div className="flex gap-2">
                  <kbd className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 font-mono text-sm">
                    1
                  </kbd>
                  <kbd className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 font-mono text-sm">
                    2
                  </kbd>
                  <kbd className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 font-mono text-sm">
                    3
                  </kbd>
                  <span className="text-gray-500 self-center">...</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                <span className="text-gray-300 text-lg">Start quiz (Welcome screen)</span>
                <kbd className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-600 font-mono text-sm">
                  Enter
                </kbd>
              </div>

              <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                <span className="text-gray-300 text-lg">Show/hide this help</span>
                <kbd className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-600 font-mono text-sm">
                  ?
                </kbd>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-lg">Close this help</span>
                <kbd className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-600 font-mono text-sm">
                  Esc
                </kbd>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <button
                onClick={onClose}
                className="bg-reinvent-purple hover:bg-purple-600 text-white font-bold py-2 px-6 rounded transition-colors"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KeyboardHelpOverlay;
