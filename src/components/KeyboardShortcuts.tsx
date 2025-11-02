// components/KeyboardShortcuts.tsx
import React from "react";
import { CloseIcon } from "./Icons";

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: "Navigation",
      items: [
        { keys: ["←", "→"], description: "Navigate between patterns" },
        { keys: ["↑", "↓"], description: "Navigate between categories" },
        { keys: ["Space"], description: "Preview selected pattern" },
        { keys: ["Esc"], description: "Close modal/dialog" },
        { keys: ["/"], description: "Focus search" },
      ],
    },
    {
      category: "Actions",
      items: [
        { keys: ["E"], description: "Export current pattern" },
        { keys: ["C"], description: "Copy CSS code" },
        { keys: ["T"], description: "Copy Tailwind code" },
        { keys: ["F"], description: "Toggle favorite" },
        { keys: ["M"], description: "Open pattern mixer" },
        { keys: ["Ctrl", "S"], description: "Save pattern" },
      ],
    },
    {
      category: "View",
      items: [
        { keys: ["G"], description: "Open generator" },
        { keys: ["L"], description: "View library" },
        { keys: ["Shift", "C"], description: "Open comparison view" },
        { keys: ["1-9"], description: "Quick category switch" },
        { keys: ["?"], description: "Show keyboard shortcuts" },
      ],
    },
    {
      category: "Customization",
      items: [
        { keys: ["Ctrl", "↑"], description: "Increase opacity" },
        { keys: ["Ctrl", "↓"], description: "Decrease opacity" },
        { keys: ["R"], description: "Randomize pattern" },
        { keys: ["D"], description: "Duplicate pattern" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Speed up your workflow with these shortcuts
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {shortcuts.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          <kbd className="px-3 py-1.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono text-gray-900 dark:text-white shadow-sm min-w-[2.5rem] text-center">
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-gray-400 px-1">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Pro Tip */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
                  Pro Tip
                </h4>
                <p className="text-sm text-indigo-800 dark:text-indigo-200">
                  Press{" "}
                  <kbd className="px-2 py-0.5 bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-700 rounded text-xs">
                    ?
                  </kbd>{" "}
                  anytime to view this shortcuts panel. Most shortcuts work
                  globally throughout the app!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
