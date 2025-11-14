// components/Hero.tsx - Enhanced version
import React from "react";
import { GithubIcon, Logo } from "./Icons";

interface HeroProps {
  isBgDark: boolean;
  onGenerateClick: () => void;
  onMixerClick?: () => void;
  onBatchExportClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({
  isBgDark,
  onGenerateClick,
  onMixerClick,
  onBatchExportClick,
}) => {
  const titleColor = isBgDark ? "text-gray-100" : "text-gray-900";
  const subtitleColor = isBgDark ? "text-gray-300" : "text-gray-600";
  const accentColor = isBgDark ? "text-indigo-400" : "text-indigo-600";
  const navIconColor = isBgDark
    ? "text-white/80 hover:text-white"
    : "text-gray-500 hover:text-gray-800";
  const navLogoColor = isBgDark ? "text-white" : "text-gray-800";

  return (
    <header className="relative w-full min-h-[85vh] flex items-center justify-center text-center overflow-hidden">
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-20">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <a
            href="#"
            className={`flex items-center space-x-2 ${navLogoColor}`}
            aria-label="StyleScape Home"
          >
            <Logo />
            <span className="font-bold text-xl hidden sm:inline">
              StyleScape
            </span>
          </a>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/chandrakantdubey/style-scape.git"
              target="_blank"
              rel="noopener noreferrer"
              className={navIconColor}
              aria-label="GitHub Repository"
            >
              <GithubIcon />
            </a>
          </div>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div>
          <h1
            className={`text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter drop-shadow-lg ${titleColor}`}
          >
            Instantly Generate
            <span className={`block ${accentColor}`}>Stunning Backgrounds</span>
          </h1>
          <p
            className={`mt-6 max-w-2xl mx-auto text-lg md:text-xl drop-shadow-md ${subtitleColor}`}
          >
            Unlock over 1000 unique, procedurally generated patterns. Mix,
            compare, and export with one-click CSS, Tailwind, React, and Vue
            code.
          </p>

          {/* Main Action Buttons */}
          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <button
              onClick={onGenerateClick}
              className="group relative inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl shadow-xl hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all transform hover:scale-105 active:scale-95"
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Generate Your Own
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                Hot
              </span>
            </button>

            <a
              href="#patterns"
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-xl shadow-xl hover:bg-white/30 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all transform hover:scale-105 active:scale-95"
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Explore Library
            </a>
          </div>

          {/* NEW: Advanced Features */}
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            {onMixerClick && (
              <button
                onClick={onMixerClick}
                className="inline-flex items-center gap-2 bg-purple-600/90 backdrop-blur-sm text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105 active:scale-95"
                title="Mix multiple patterns together (Press M)"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                Pattern Mixer
              </button>
            )}

            {onBatchExportClick && (
              <button
                onClick={onBatchExportClick}
                className="inline-flex items-center gap-2 bg-green-600/90 backdrop-blur-sm text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition-all transform hover:scale-105 active:scale-95"
                title="Export multiple patterns at once"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Batch Export
              </button>
            )}

            <button
              onClick={() => {
                const event = new KeyboardEvent("keydown", {
                  key: "?",
                  shiftKey: true,
                });
                window.dispatchEvent(event);
              }}
              className="inline-flex items-center gap-2 bg-gray-800/90 backdrop-blur-sm text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:bg-gray-900 transition-all transform hover:scale-105 active:scale-95"
              title="View keyboard shortcuts"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Shortcuts
            </button>
          </div>

          {/* NEW: Feature Highlights */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div
              className={`backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 ${
                isBgDark ? "text-white" : "text-gray-900"
              }`}
            >
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-bold text-lg mb-2">1000+ Patterns</h3>
              <p className="text-sm opacity-80">
                Procedurally generated backgrounds in multiple categories and
                themes
              </p>
            </div>

            <div
              className={`backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 ${
                isBgDark ? "text-white" : "text-gray-900"
              }`}
            >
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-lg mb-2">One-Click Export</h3>
              <p className="text-sm opacity-80">
                CSS, Tailwind, React, Vue, SVG, PNG - we've got you covered
              </p>
            </div>

            <div
              className={`backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 ${
                isBgDark ? "text-white" : "text-gray-900"
              }`}
            >
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-bold text-lg mb-2">Power Features</h3>
              <p className="text-sm opacity-80">
                Mix patterns, batch export, keyboard shortcuts, and more
              </p>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-12">
            <a
              href="#patterns"
              className="inline-flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
            >
              <span
                className={`text-sm ${
                  isBgDark ? "text-white" : "text-gray-900"
                }`}
              >
                Scroll to explore
              </span>
              <svg
                className={`w-6 h-6 animate-bounce ${
                  isBgDark ? "text-white" : "text-gray-900"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
