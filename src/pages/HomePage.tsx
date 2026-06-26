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
  const [activeCategory, setActiveCategoryState] = useSessionState("stylescape:home-category", "Topo");
  const [activeThemeFilter, setActiveThemeFilterState] = useSessionState("stylescape:home-theme", "Light");
  const [searchTerm, setSearchTermState] = useSessionState("stylescape:home-search", "");
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set());
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

  const handleCategoryClick = useCallback((category: string) => {
    setActiveCategory(category);
    setSearchTerm("");
    saveSessionState("stylescape:home-search", "");
    setActiveThemeFilter("Light");
    saveSessionState("stylescape:home-theme", "Light");
    setRuntimeGeneratedPresets([]);

    setTimeout(() => {
      const matchingPresets = presets.filter((p) => {
        if (category === "Favourites") return favorites.includes(p.id);
        if (category === "User Created") return userCreatedPresets.some((ucp) => ucp.id === p.id);
        return p.category === category;
      });
      if (matchingPresets.length > 0) onPreview(matchingPresets[0]);
    }, 50);
  }, [setActiveCategory, setSearchTerm, setActiveThemeFilter, presets, favorites, userCreatedPresets, onPreview]);

  const handleGenerateMore = useCallback(() => {
    if (!isActiveCategory(activeCategory)) return;
    const generator = generatorMap[activeCategory as keyof typeof generatorMap];
    if (!generator) return;
    const theme = activeThemeFilter.toLowerCase() as PresetTheme;
    setLoadingCategories((prev) => new Set(prev).add(activeCategory));
    setTimeout(() => {
      const existing = runtimeGeneratedPresets.filter(
        (p) => p.category === activeCategory && p.theme === theme
      ).length;
      const newPatterns: Preset[] = [];
      const TARGET = Math.min(existing + 10, 50);
      for (let i = existing; i < TARGET; i++) {
        const id = `${activeCategory.toLowerCase().replace(" ", "")}-${theme}-extra-${i}`;
        const name = `${activeCategory} ${theme.charAt(0).toUpperCase() + theme.slice(1)} #${i + 1}`;
        const preset = generator(id, name, theme, false, id);
        newPatterns.push(preset);
      }
      setRuntimeGeneratedPresets((prev) => {
        const byId = new Map(prev.map((p) => [p.id, p]));
        newPatterns.forEach((p) => byId.set(p.id, p));
        return Array.from(byId.values());
      });
      setLoadingCategories((prev) => {
        const next = new Set(prev);
        next.delete(activeCategory);
        return next;
      });
      if (newPatterns.length > 0) onPreview(newPatterns[0]);
    }, 100);
  }, [activeCategory, activeThemeFilter, runtimeGeneratedPresets, onPreview]);

  const filteredPresets = useMemo(() => {
    return allPresets.filter((p) => {
      if (activeCategory === "Favourites") {
        if (!favorites.includes(p.id)) return false;
      } else if (activeCategory === "User Created") {
        return userCreatedPresets.some(ucp => ucp.id === p.id);
      } else if (p.category !== activeCategory) {
        return false;
      }
      const themeFilterLower = activeThemeFilter.toLowerCase();
      if (p.theme !== themeFilterLower) return false;
      if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [activeCategory, activeThemeFilter, searchTerm, favorites, allPresets, userCreatedPresets]);

  const categories = [...ACTIVE_CATEGORIES, "Favourites", "User Created"];
  const themeFilters = ["Light", "Dark"];

  const textColor = isBgDark ? "text-white" : "text-gray-900";
  const subtitleColor = isBgDark ? "text-gray-300" : "text-gray-600";
  const bgPanel = isBgDark ? "bg-gray-900/70" : "bg-white/70";
  const borderColor = isBgDark ? "border-gray-700" : "border-gray-200";
  const navColor = isBgDark ? "text-white" : "text-gray-800";
  const dimColor = isBgDark ? "text-gray-400" : "text-gray-500";

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
      {/* ─── Nav ─────────────────────────────────────────────── */}
      <header className="relative w-full">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2 flex justify-between items-center">
          <a href="#" className={`flex items-center gap-2 ${navColor}`}>
            <Logo />
            <span className="font-bold text-lg hidden sm:inline">StyleScape</span>
          </a>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/generator")}
              className="text-sm font-medium px-4 py-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              Generator
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`${navColor} hover:opacity-70 transition-opacity`}
            >
              <GithubIcon />
            </a>
          </div>
        </nav>

        {/* ─── Hero ────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 text-center">
          {/* Badge */}
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full mb-6 ${
            isBgDark
              ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
              : "bg-indigo-50 text-indigo-600 border border-indigo-200"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
            {allPresets.length.toLocaleString()}+ patterns ready to use
          </span>

          <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] ${textColor}`}>
            Beautiful backgrounds,
            <br />
            <span className={isBgDark ? "text-indigo-400" : "text-indigo-600"}>
              no design skills needed.
            </span>
          </h1>

          <p className={`mt-6 max-w-xl mx-auto text-lg leading-relaxed ${subtitleColor}`}>
            Browse 1,000+ procedural backgrounds across gradients, waves, grids,
            glass, abstract shapes, and more. Copy the code or download in one click.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate("/generator")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-lg hover:bg-indigo-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate your own
            </button>
            <a
              href="#patterns"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors ${
                isBgDark
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-gray-900/8 text-gray-900 hover:bg-gray-900/12 border border-gray-200"
              }`}
            >
              Browse library
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>

          {/* Stats row */}
          <div className={`mt-14 flex flex-wrap justify-center gap-8 text-sm ${dimColor}`}>
            {[
              ["13", "Pattern types"],
              ["80", "Presets per type"],
              ["CSS / SVG / PNG", "Export formats"],
              ["React, Vue, Svelte", "Framework snippets"],
            ].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className={`text-xl font-bold ${textColor}`}>{val}</div>
                <div className="text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ─── Pattern Library ─────────────────────────────────── */}
      <main id="patterns" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

        {/* Section heading */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className={`text-2xl font-bold ${textColor}`}>Pattern Library</h2>
            <p className={`text-sm mt-1 ${dimColor}`}>Click any pattern to preview and export</p>
          </div>
          {/* Search */}
          <div className="relative hidden sm:block">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="search"
              placeholder="Search…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-9 pr-4 py-2 text-sm rounded-lg border w-52 ${borderColor} ${
                isBgDark
                  ? "bg-gray-800/60 text-white placeholder-gray-500"
                  : "bg-white/60 text-gray-900 placeholder-gray-400"
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
        </div>

        {/* Mobile search */}
        <div className="relative sm:hidden mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="search"
            placeholder="Search patterns…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border ${borderColor} ${
              isBgDark
                ? "bg-gray-800/60 text-white placeholder-gray-500"
                : "bg-white/60 text-gray-900 placeholder-gray-400"
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
        </div>

        {/* Category tabs — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1 scrollbar-none">
          {categories.map((cat) => {
            const isLoading = loadingCategories.has(cat);
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                disabled={isLoading}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md"
                    : isBgDark
                    ? "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60"
                    : "bg-white/60 text-gray-700 hover:bg-gray-100/80 border border-gray-200"
                } ${isLoading ? "opacity-50 cursor-wait" : ""}`}
              >
                {cat === "Favourites" && <StarIcon filled className="w-3 h-3" />}
                {cat}
                {isLoading && (
                  <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Theme toggle + count row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-1.5">
            {themeFilters.map((theme) => (
              <button
                key={theme}
                onClick={() => setActiveThemeFilter(theme)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeThemeFilter === theme
                    ? isBgDark
                      ? "bg-white text-gray-900"
                      : "bg-gray-900 text-white"
                    : isBgDark
                    ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
                    : "bg-white/50 text-gray-600 hover:bg-gray-100/80 border border-gray-200"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
          <span className={`text-xs ${dimColor}`}>
            {filteredPresets.length} pattern{filteredPresets.length !== 1 ? "s" : ""}
            {isActiveCategory(activeCategory) && filteredPresets.length > 0 && (
              <button
                type="button"
                onClick={handleGenerateMore}
                disabled={loadingCategories.has(activeCategory)}
                className={`ml-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                  isBgDark
                    ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                }`}
              >
                {loadingCategories.has(activeCategory) ? "…" : "+ 10 more"}
              </button>
            )}
          </span>
        </div>

        {/* Pattern Grid */}
        {filteredPresets.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredPresets.map((preset) => {
              const dataUrl = getSVGDataUrl(preset);
              const isFavorite = favorites.includes(preset.id);
              return (
                <div
                  key={preset.id}
                  className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                  onClick={() => handlePatternClick(preset)}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${dataUrl}")` }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
                    <p className="text-white text-xs font-semibold leading-tight">{preset.name}</p>
                    <p className="text-white/60 text-[10px] mt-0.5">{preset.category}</p>
                  </div>
                  {/* Star */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(preset.id); }}
                    className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all z-10 opacity-0 group-hover:opacity-100 ${
                      isFavorite
                        ? "bg-yellow-400/25 text-yellow-400 !opacity-100"
                        : "bg-black/30 text-white/80 hover:text-white hover:bg-black/50"
                    }`}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <StarIcon filled={isFavorite} className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`${bgPanel} backdrop-blur-lg rounded-2xl border ${borderColor} p-16 text-center`}>
            <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={`text-base font-semibold ${textColor}`}>No patterns found</p>
            <p className={`mt-1 text-sm ${dimColor}`}>Try adjusting your filters or search term</p>
            <button
              onClick={() => { setActiveCategory("Gradients"); setActiveThemeFilter("Light"); setSearchTerm(""); }}
              className="mt-5 px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition-colors"
            >
              Reset filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
