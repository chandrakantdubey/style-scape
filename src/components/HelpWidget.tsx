// components/HelpWidget.tsx
import React, { useState, useEffect } from "react";

interface HelpWidgetProps {
  isBgDark: boolean;
}

const HelpWidget: React.FC<HelpWidgetProps> = ({ isBgDark }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "?" && event.shiftKey) {
        event.preventDefault();
        setIsModalOpen(true);
      }
      if (event.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const shortcuts = [
    { key: "?", shift: true, description: "Show keyboard shortcuts" },
    { key: "/", description: "Focus search" },
    { key: "G", description: "Open generator" },
    { key: "M", description: "Open pattern mixer" },
    { key: "L", description: "View library" },
    { key: "R", description: "Randomize pattern" },
    { key: "F", description: "Toggle favorite" },
    { key: "E", description: "Export pattern" },
    { key: "C", description: "Copy CSS code" },
    { key: "T", description: "Copy Tailwind code" },
    { key: "Space", description: "Preview pattern" },
    { key: "Ctrl+S", description: "Save pattern" },
    { key: "Ctrl+Z", description: "Undo" },
    { key: "Ctrl+Y", description: "Redo" },
    { key: "Esc", description: "Close modal/dialog" },
    { key: "← →", description: "Navigate patterns" },
    { key: "↑ ↓", description: "Navigate categories" },
  ];

  const formatShortcut = (shortcut: typeof shortcuts[0]) => {
    let key = shortcut.key;
    if (shortcut.shift) key = `Shift+${key}`;
    return key;
  };

  return (
    <>
      {/* Help Widget Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-3 rounded-full backdrop-blur-md border transition-all transform hover:scale-110 ${
          isBgDark
            ? "bg-gray-800/90 border-gray-600 text-white hover:bg-gray-700"
            : "bg-white/90 border-gray-300 text-gray-800 hover:bg-gray-50"
        } shadow-lg`}
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (Shift+?)"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div
            className={`relative max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl ${
              isBgDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            } border p-6`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-2xl font-bold ${
                  isBgDark ? "text-white" : "text-gray-900"
                }`}
              >
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isBgDark
                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }`}
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Shortcuts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isBgDark ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      isBgDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {shortcut.description}
                  </span>
                  <kbd
                    className={`px-2 py-1 text-xs font-mono rounded border ${
                      isBgDark
                        ? "bg-gray-600 border-gray-500 text-gray-200"
                        : "bg-gray-200 border-gray-300 text-gray-700"
                    }`}
                  >
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p
                className={`text-sm ${
                  isBgDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Press <kbd className={`px-1 py-0.5 text-xs font-mono rounded ${
                  isBgDark ? "bg-gray-600 text-gray-200" : "bg-gray-200 text-gray-700"
                }`}>Esc</kbd> or click outside to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpWidget;
