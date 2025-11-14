import React from "react";
import type { Preset, PresetCategory } from "../state/types";
import LazyPatternCard from "./LazyPatternCard";
import { SearchIcon, StarIcon } from "./Icons";

interface PatternLibraryProps {
  presets: Preset[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  activeThemeFilter: string;
  onThemeFilterChange: (theme: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onPreview: (preset: Preset) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  hasFavorites: boolean;
  isBgDark: boolean;
  onOpenMixer?: () => void;
  onOpenComparison?: () => void;
  onOpenBatchExport?: () => void;
}

const CATEGORIES: (PresetCategory | "All" | "Favourites")[] = [
  "All",
  "Gradients",
  "Decorative",
  "Geometric",
  "Minimalist",
  "Waves",
  "Abstract",
  "Metallic",
  "Grid",
  "Glassmorphism",
  "Texture",
  "Particles",
  "Mesh",
  "Stripe",
  "Favourites",
];
const THEME_FILTERS = ["All", "Light", "Dark", "Colored"];

const PatternLibrary: React.FC<PatternLibraryProps> = ({
  presets,
  activeCategory,
  onCategoryChange,
  activeThemeFilter,
  onThemeFilterChange,
  searchTerm,
  onSearchChange,
  onPreview,
  favorites,
  onToggleFavorite,
  isBgDark,
  onOpenMixer,
  onOpenBatchExport,
  onOpenComparison,
}) => {
  const titleColor = isBgDark ? "text-gray-100" : "text-gray-900";
  const subtitleColor = isBgDark ? "text-gray-300" : "text-gray-600";
  const categoryBtnBase = isBgDark
    ? "bg-gray-800/70 text-gray-200 hover:bg-gray-700"
    : "bg-white/70 text-gray-700 hover:bg-gray-100";
  const themeBtnBase = isBgDark
    ? "bg-gray-800/50 text-gray-300 hover:bg-gray-700"
    : "bg-white/50 text-gray-600 hover:bg-gray-200";
  const searchInputBase = isBgDark
    ? "bg-gray-800/70 border-gray-600 text-white"
    : "bg-white/70 border-gray-300 text-gray-900";
  const searchIconColor = isBgDark ? "text-gray-500" : "text-gray-400";
  const countPillBase = isBgDark
    ? "text-gray-300 bg-gray-800/50"
    : "text-gray-700 bg-white/50";
  const emptyFavsBase = isBgDark
    ? "text-gray-400 bg-gray-800/50"
    : "text-gray-600 bg-white/50";

  return (
    <main
      id="patterns"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="text-center">
        <h2 className={`text-4xl font-extrabold drop-shadow-lg ${titleColor}`}>
          Pattern Library
        </h2>
        <p className={`mt-2 text-lg drop-shadow-md ${subtitleColor}`}>
          Tap on mobile or hover on desktop to see options.
        </p>
      </div>

      {onOpenMixer && onOpenComparison && onOpenBatchExport && (
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={onOpenMixer}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
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
            Mix Patterns
          </button>
          <button
            onClick={onOpenComparison}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Compare
          </button>
          <button
            onClick={onOpenBatchExport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
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
        </div>
      )}

      <div className="mt-12 space-y-4">
        <div className="flex justify-center flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-full transition-colors backdrop-blur-sm ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white"
                  : categoryBtnBase
              }`}
            >
              {cat === "Favourites" && (
                <StarIcon filled={true} className="h-4 w-4" />
              )}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-center flex-wrap gap-2">
          {THEME_FILTERS.map((theme) => (
            <button
              key={theme}
              onClick={() => onThemeFilterChange(theme)}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors backdrop-blur-sm ${
                activeThemeFilter === theme
                  ? "bg-gray-700 text-white"
                  : themeBtnBase
              }`}
            >
              {theme}
            </button>
          ))}
        </div>

        <div className="pt-4 max-w-xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none pt-4">
            <SearchIcon className={searchIconColor} />
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search patterns..."
            className={`block w-full backdrop-blur-sm border rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${searchInputBase}`}
          />
        </div>
      </div>

      <p
        className={`mt-8 text-center text-sm font-medium inline-block backdrop-blur-sm rounded-full px-4 py-1 ${countPillBase}`}
      >
        Showing {presets.length} patterns
      </p>

      {activeCategory === "Favourites" && presets.length === 0 && (
        <div
          className={`mt-12 text-center backdrop-blur-sm rounded-lg p-8 ${emptyFavsBase}`}
        >
          <h3 className="text-xl font-semibold">No Favourites Yet!</h3>
          <p className="mt-2">
            Click the star icon on any pattern to add it to your favourites.
          </p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {presets.map((preset) => (
          <LazyPatternCard
            key={preset.id}
            preset={preset}
            onPreview={onPreview}
            isFavorite={favorites.includes(preset.id)}
            onToggleFavorite={() => onToggleFavorite(preset.id)}
          />
        ))}
      </div>
    </main>
  );
};

export default PatternLibrary;
