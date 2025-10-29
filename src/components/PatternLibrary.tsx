import React from "react";
import type { Preset } from "../state/types";
import LazyPatternCard from "./LazyPatternCard";
import { SearchIcon, StarIcon } from "./Icons";

interface PatternLibraryProps {
  presets: Preset[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onPreview: (preset: Preset) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  hasFavorites: boolean;
}

const CATEGORIES = [
  "All",
  "Gradients",
  "Decorative",
  "Geometric",
  "Waves",
  "Abstract",
  "Favourites",
];

const PatternLibrary: React.FC<PatternLibraryProps> = ({
  presets,
  activeCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  onPreview,
  favorites,
  onToggleFavorite,
  //   hasFavorites,
}) => {
  return (
    <main
      id="patterns"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 drop-shadow-lg">
          Canvas Library
        </h2>
        <p className="mt-2 text-lg text-grey-600 dark:text-grey-300 drop-shadow-md">
          Hover on card and tap on preview to see it come alive.
        </p>
      </div>

      <div className="mt-12">
        <div className="flex justify-center flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {cat === "Favourites" && (
                <StarIcon filled={true} className="h-4 w-4" />
              )}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 max-w-xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search patterns..."
            className="block w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white"
          />
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-700 dark:text-gray-300 font-medium inline-block bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-1">
        {presets.length} patterns in {activeCategory}
      </p>

      {activeCategory === "Favourites" && presets.length === 0 && (
        <div className="mt-12 text-center text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-8">
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
