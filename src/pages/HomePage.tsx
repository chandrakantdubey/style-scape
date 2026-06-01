import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import type { Preset, PresetTheme } from "../state/types";
import { renderSVG } from "../render/svgRenderer";
import { svgToDataUrl } from "../render/svgUtils";
import { StarIcon, SearchIcon, Logo, GithubIcon } from "../components/Icons";
import { ACTIVE_CATEGORIES, generatorMap, isActiveCategory } from "../presets/catalog";
import { saveSessionState, useSessionState } from "../hooks/useSessionState";

interface HomePageProps {
  presets: Preset[];
  userCreatedPresets: Preset[];
  onPreview: (preset: Preset) => void;
  isBgDark: boolean;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  presets,
  userCreatedPresets,
  onPreview,
  isBgDark,
  favorites,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategoryState] = useSessionState("stylescape:home-category", "Gradients");
  const [activeThemeFilter, setActiveThemeFilterState] = useSessionState("stylescape:home-theme", "All");
  const [searchTerm, setSearchTermState] = useSessionState("stylescape:home-search", "");
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set());
  const [generatedCategories, setGeneratedCategories] = useState<Set<string>>(new Set());
  const [runtimeGeneratedPresets, setRuntimeGeneratedPresets] = useState<Preset[]>([]);

  const setActiveCategory = useCallback((category: string) => {
    setActiveCategoryState(category);
    saveSessionState("stylescape:home-category", category);
  }, [setActiveCategoryState]);

  const setActiveThemeFilter = useCallback((theme: string) => {
    setActiveThemeFilterState(theme);
    saveSessionState("stylescape:home-theme", theme);
  }, [setActiveThemeFilterState]);

  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
    saveSessionState("stylescape:home-search", term);
  }, [setSearchTermState]);

  const allPresets = useMemo(
    () => [...presets, ...userCreatedPresets, ...runtimeGeneratedPresets],
    [presets, userCreatedPresets, runtimeGeneratedPresets]
  );

  // Lazy loading function
  const handleCategoryClick = useCallback((category: string) => {
    setActiveCategory(category);

    // Clear search term and reset theme filter when switching tabs/categories
    setSearchTerm("");
    saveSessionState("stylescape:home-search", "");
    setActiveThemeFilter("All");
    saveSessionState("stylescape:home-theme", "All");

    // Skip lazy loading for special categories
    if (category === "Favourites" || category === "User Created" || !isActiveCategory(category)) {
      setTimeout(() => {
        const matchingPresets = allPresets.filter(p => {
          if (category === "Favourites") return favorites.includes(p.id);
          if (category === "User Created") return userCreatedPresets.some(ucp => ucp.id === p.id);
          return p.category === category;
        });
        if (matchingPresets.length > 0) {
          onPreview(matchingPresets[0]);
        }
      }, 50);
      return;
    }

    // Check if category is already generated
    if (generatedCategories.has(category)) {
      setTimeout(() => {
        const matchingPresets = allPresets.filter(p => p.category === category);
        if (matchingPresets.length > 0) {
          onPreview(matchingPresets[0]);
        }
      }, 50);
      return;
    }

    // Start loading
    setLoadingCategories(prev => new Set(prev).add(category));

    // Generate patterns for this category
    setTimeout(() => {
      const newPatterns: Preset[] = [];
      const themesToGenerate: PresetTheme[] = ["light", "dark", "colored"];

      themesToGenerate.forEach((theme) => {
        const generator = generatorMap[category];
        // Generate 30 patterns per theme (90 total per category)
        for (let i = 0; i < 30; i++) {
          const id = `${category.toLowerCase().replace(" ", "")}-${theme}-${i}`;
          const name = `${category} ${theme.charAt(0).toUpperCase() + theme.slice(1)} #${i + 1}`;
          const seed = id;
          const preset = generator(id, name, theme, false, seed);
          newPatterns.push(preset);
        }
      });

      setRuntimeGeneratedPresets(prev => {
        const byId = new Map(prev.map((preset) => [preset.id, preset]));
        newPatterns.forEach((preset) => byId.set(preset.id, preset));
        return Array.from(byId.values());
      });

      // Mark category as generated
      setGeneratedCategories(prev => new Set(prev).add(category));
      setLoadingCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(category);
        return newSet;
      });

      // Automatically preview the first generated pattern
      if (newPatterns.length > 0) {
        onPreview(newPatterns[0]);
      }
    }, 100);
  }, [generatedCategories, setActiveCategory, setSearchTerm, setActiveThemeFilter, allPresets, favorites, userCreatedPresets, onPreview]);

  const filteredPresets = useMemo(() => {
    return allPresets.filter((p) => {
      if (activeCategory === "Favourites") {
        if (!favorites.includes(p.id)) return false;
      } else if (activeCategory === "User Created") {
        // Check if this preset is in the user-created list
        return userCreatedPresets.some(ucp => ucp.id === p.id);
      } else if (p.category !== activeCategory) {
        return false;
      }

      const themeFilterLower = activeThemeFilter.toLowerCase();
      if (activeThemeFilter !== "All" && p.theme !== themeFilterLower) {
        return false;
      }

      if (
        searchTerm &&
        !p.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [activeCategory, activeThemeFilter, searchTerm, favorites, allPresets, userCreatedPresets]);

  const categories = [...ACTIVE_CATEGORIES, "Favourites", "User Created"];
  const themeFilters = ["All", "Light", "Dark", "Colored"];

  const textColor = isBgDark ? "text-white" : "text-gray-900";
  const subtitleColor = isBgDark ? "text-gray-300" : "text-gray-600";
  const bgPanel = isBgDark ? "bg-gray-900/70" : "bg-white/70";
  const borderColor = isBgDark ? "border-gray-700" : "border-gray-200";
  const navColor = isBgDark ? "text-white" : "text-gray-800";
  const accentColor = isBgDark ? "text-indigo-400" : "text-indigo-600";

  const handlePatternClick = useCallback(
    (preset: Preset) => {
      onPreview(preset);
      navigate(`/pattern/${preset.id}`);
    },
    [navigate, onPreview]
  );

  const getSVGDataUrl = useCallback((preset: Preset): string => {
    const svgString = renderSVG({
      canvas: preset.canvas,
      layers: preset.layers,
      selectedLayerId: null,
    } as any);
    return svgToDataUrl(svgString);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="relative w-full min-h-[85vh] flex items-center justify-center text-center">
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-20">
          <nav className="max-w-7xl mx-auto flex justify-between items-center">
            <a href="#" className={`flex items-center space-x-2 ${navColor}`}>
              <Logo />
              <span className="font-bold text-xl hidden sm:inline">
                StyleScape
              </span>
            </a>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`${navColor} hover:opacity-80 transition-opacity`}
              >
                <GithubIcon />
              </a>
            </div>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h1
            className={`readable-on-bg text-5xl md:text-6xl lg:text-7xl font-extrabold drop-shadow-lg ${textColor}`}
          >
            Instantly Generate
            <span className={`block ${accentColor}`}>Stunning Backgrounds</span>
          </h1>
          <p
            className={`readable-on-bg mt-6 max-w-2xl mx-auto text-lg md:text-xl drop-shadow-md ${subtitleColor}`}
          >
            Over {presets.length}+ focused procedural backgrounds across
            gradients, waves, grids, glass, and abstract compositions.
          </p>

          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate("/generator")}
              className="control-surface group relative inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-8 py-4 rounded-lg shadow-xl hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all transform hover:scale-105 active:scale-95"
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
                New
              </span>
            </button>
            <a
              href="#patterns"
              className={`control-surface inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-lg shadow-xl focus:outline-none focus:ring-4 transition-all transform hover:scale-105 active:scale-95 ${
                isBgDark
                  ? "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 focus:ring-white/50"
                  : "bg-gray-950/85 backdrop-blur-sm text-white hover:bg-gray-950 focus:ring-gray-950/30"
              }`}
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

          {/* Feature Highlights */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div
              className={`control-surface backdrop-blur-md rounded-lg p-6 border ${
                isBgDark ? "bg-gray-950/60 border-white/20 text-white" : "bg-white/85 border-gray-200 text-gray-950"
              }`}
            >
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-bold text-lg mb-2">
                {allPresets.length}+ Patterns
              </h3>
              <p className="text-sm opacity-80">
                Five distinct visual engines with light, dark, and colored
                variants
              </p>
            </div>

            <div
              className={`control-surface backdrop-blur-md rounded-lg p-6 border ${
                isBgDark ? "bg-gray-950/60 border-white/20 text-white" : "bg-white/85 border-gray-200 text-gray-950"
              }`}
            >
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-lg mb-2">One-Click Export</h3>
              <p className="text-sm opacity-80">
                Copy CSS or export production-ready SVG and PNG assets
              </p>
            </div>

            <div
              className={`control-surface backdrop-blur-md rounded-lg p-6 border ${
                isBgDark ? "bg-gray-950/60 border-white/20 text-white" : "bg-white/85 border-gray-200 text-gray-950"
              }`}
            >
              <div className="text-3xl mb-3">▦</div>
              <h3 className="font-bold text-lg mb-2">Saved Context</h3>
              <p className="text-sm opacity-80">
                Return from details or generation to the same selected filters
              </p>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-12">
            <a
              href="#patterns"
              className="inline-flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className={`text-sm ${textColor}`}>Scroll to explore</span>
              <svg
                className={`w-6 h-6 animate-bounce ${textColor}`}
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
      </header>

      {/* Pattern Library */}
      <main
        id="patterns"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-extrabold drop-shadow-lg ${textColor}`}>
            Pattern Library
          </h2>
          <p className={`mt-2 text-lg drop-shadow-md ${subtitleColor}`}>
            Click any pattern to view details and export options
          </p>
        </div>

        {/* Filters and Search - Centered, no background box */}
        <div className="text-center mb-8">
          {/* Search */}
          <div className="relative mb-6 max-w-md mx-auto">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search patterns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${borderColor} ${
                isBgDark
                  ? "bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-500"
                  : "bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400"
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {categories.map((cat) => {
              const isLoading = loadingCategories.has(cat);
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg scale-105"
                      : isBgDark
                      ? "bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 text-gray-300"
                      : "bg-white/50 backdrop-blur-sm hover:bg-gray-100/50 text-gray-700"
                  } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {cat === "Favourites" && (
                    <StarIcon filled className="w-4 h-4" />
                  )}
                  {cat}
                  {isLoading && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Theme Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {themeFilters.map((theme) => (
              <button
                key={theme}
                onClick={() => setActiveThemeFilter(theme)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeThemeFilter === theme
                    ? "bg-gray-700 text-white scale-105"
                    : isBgDark
                    ? "bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 text-gray-400"
                    : "bg-white/50 backdrop-blur-sm hover:bg-gray-100/50 text-gray-600"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <p className={`text-center text-sm font-medium mb-6 ${subtitleColor}`}>
          Showing {filteredPresets.length} pattern
          {filteredPresets.length !== 1 ? "s" : ""}
        </p>

        {/* Pattern Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPresets.map((preset) => {
              const dataUrl = getSVGDataUrl(preset);
              const isFavorite = favorites.includes(preset.id);

              return (
                <div
                  key={preset.id}
                  className="aspect-square rounded-xl shadow-lg overflow-hidden relative group cursor-pointer transform transition-transform hover:scale-105"
                  onClick={() => handlePatternClick(preset)}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${dataUrl}")` }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                    <div className="text-center">
                      <h3 className="text-white font-bold text-lg mb-1">
                        {preset.name}
                      </h3>
                      <p className="text-gray-300 text-sm mb-4">
                        {preset.category} • {preset.theme}
                      </p>
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(preset.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all z-10 ${
                      isFavorite
                        ? "bg-yellow-400/20 text-yellow-400"
                        : "bg-black/30 text-white/80 hover:text-white hover:bg-black/50"
                    }`}
                    aria-label={
                      isFavorite ? "Remove from favorites" : "Add to favorites"
                    }
                  >
                    <StarIcon filled={isFavorite} className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
        </div>

        {filteredPresets.length === 0 && (
          <div
            className={`${bgPanel} backdrop-blur-lg rounded-xl border ${borderColor} p-12 text-center`}
          >
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className={`text-xl font-semibold ${textColor}`}>
              No patterns found
            </p>
            <p className={`mt-2 ${subtitleColor}`}>
              Try adjusting your filters or search term
            </p>
            <button
              onClick={() => {
                setActiveCategory("Gradients");
                setActiveThemeFilter("All");
                setSearchTerm("");
              }}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
