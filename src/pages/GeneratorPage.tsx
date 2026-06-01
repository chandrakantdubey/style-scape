// pages/GeneratorPage.tsx - COMPLETE VERSION
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { HexColorPicker } from "react-colorful";
import type { Preset, PresetTheme } from "../state/types";
import { ACTIVE_CATEGORIES, generatorMap, type ActivePresetCategory } from "../presets/catalog";
import { renderSVG } from "../render/svgRenderer";
import { svgToDataUrl } from "../render/svgUtils";
import { saveSessionState, useSessionState } from "../hooks/useSessionState";
import useStore from "../state/store";

interface GeneratorPageProps {
  onPreview: (preset: Preset) => void;
  isBgDark: boolean;
}

const FILTER_CATEGORIES: ("All" | ActivePresetCategory)[] = ["All", ...ACTIVE_CATEGORIES];
const THEME_FILTERS: ("All" | "Light" | "Dark")[] = ["All", "Light", "Dark"];

const GeneratorPage: React.FC<GeneratorPageProps> = ({
  onPreview,
  isBgDark,
}) => {
  const navigate = useNavigate();
  const [colors, setColors] = useState(() => [
    { id: `c-${Date.now()}-1`, value: "#6366f1" },
    { id: `c-${Date.now()}-2`, value: "#ec4899" },
  ]);
  const [generatedPatterns, setGeneratedPatterns] = useState<Preset[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategoryState] = useSessionState<ActivePresetCategory>(
    "stylescape:generator-category",
    "Gradients"
  );

  const { addUserCreatedPresets } = useStore();
  const [activeCategory, setActiveCategoryState] = useSessionState<string>(
    "stylescape:generator-filter-category",
    "All"
  );
  const [activeThemeFilter, setActiveThemeFilterState] = useSessionState<string>(
    "stylescape:generator-filter-theme",
    "All"
  );

  const setSelectedCategory = (category: ActivePresetCategory) => {
    setSelectedCategoryState(category);
    saveSessionState("stylescape:generator-category", category);
  };

  const setActiveCategory = (category: string) => {
    setActiveCategoryState(category);
    saveSessionState("stylescape:generator-filter-category", category);
  };

  const setActiveThemeFilter = (theme: string) => {
    setActiveThemeFilterState(theme);
    saveSessionState("stylescape:generator-filter-theme", theme);
  };

  const updateColor = (id: string, newColor: string) => {
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, value: newColor } : c))
    );
  };

  const addColor = () => {
    if (colors.length < 5) {
      setColors((prev) => [
        ...prev,
        { id: `c-${Date.now()}`, value: "#ffffff" },
      ]);
    }
  };

  const removeColor = (id: string) => {
    if (colors.length > 2) {
      setColors((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setGeneratedPatterns([]);
    setActiveCategory("All");
    setActiveThemeFilter("All");

    setTimeout(() => {
      const userColors = colors.map((c) => c.value);
      const customPalette: string[][] = [];
      if (userColors.length > 1) {
        for (let i = 0; i < userColors.length; i++) {
          customPalette.push([
            userColors[i],
            userColors[(i + 1) % userColors.length],
          ]);
        }
      } else if (userColors.length === 1) {
        customPalette.push([userColors[0], userColors[0]]);
      }

      const newPatterns: Preset[] = [];
      const themesToGenerate: PresetTheme[] = ["dark", "light"];

      // Only generate for selected category
      themesToGenerate.forEach((theme) => {
        const generator = generatorMap[selectedCategory];
        for (let i = 0; i < 5; i++) {
          const id = `user-generated-${selectedCategory.toLowerCase()}-${theme}-${i}`;
          const seed = id;
          const name = `Generated ${selectedCategory} ${theme} #${i + 1}`;
          const preset = generator(
            id,
            name,
            theme,
            false,
            seed,
            customPalette
          );
          newPatterns.push(preset);
        }
      });

      addUserCreatedPresets(newPatterns);

      // Shuffle patterns
      for (let i = newPatterns.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newPatterns[i], newPatterns[j]] = [newPatterns[j], newPatterns[i]];
      }

      setGeneratedPatterns(newPatterns);
      setIsGenerating(false);
      if (newPatterns.length > 0) {
        onPreview(newPatterns[0]);
      }
    }, 100);
  }, [addUserCreatedPresets, colors, selectedCategory, onPreview, setActiveCategory, setActiveThemeFilter]);

  const filteredPatterns = generatedPatterns.filter((p) => {
    if (activeCategory !== "All" && p.category !== activeCategory) {
      return false;
    }
    const themeFilterLower = activeThemeFilter.toLowerCase();
    if (activeThemeFilter !== "All" && p.theme !== themeFilterLower) {
      return false;
    }
    return true;
  });

  const textColor = isBgDark ? "text-white" : "text-gray-900";
  const bgPanel = isBgDark ? "bg-gray-900/80" : "bg-white/80";
  const borderColor = isBgDark ? "border-gray-700" : "border-gray-300";
  const emptyStateBg = isBgDark ? "bg-gray-800/50" : "bg-white/50";
  const categoryBtnBase = isBgDark
    ? "bg-gray-800/70 text-gray-200 hover:bg-gray-700"
    : "bg-white/70 text-gray-700 hover:bg-gray-100";
  const themeBtnBase = isBgDark
    ? "bg-gray-800/50 text-gray-300 hover:bg-gray-700"
    : "bg-white/50 text-gray-600 hover:bg-gray-200";
  const countPillBase = isBgDark
    ? "text-gray-300 bg-gray-800/50"
    : "text-gray-700 bg-white/50";

  const handlePatternClick = (preset: Preset) => {
    onPreview(preset);
    navigate(`/pattern/${preset.id}`);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header
        className={`sticky top-0 ${bgPanel} backdrop-blur-lg border-b ${borderColor} z-10`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${textColor}`}>
                Pattern Generator
              </h1>
              <p
                className={`text-sm mt-1 ${
                  isBgDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Create custom patterns with your color palette
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isBgDark
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-900"
              }`}
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Generator Controls */}
        <div
          className={`${bgPanel} backdrop-blur-lg rounded-xl border ${borderColor} p-6`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h3 className={`text-lg font-semibold mb-3 ${textColor}`}>
                Your Color Palette
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                {colors.map((color) => (
                  <div key={color.id} className="relative group">
                    <HexColorPicker
                      color={color.value}
                      onChange={(newColor) => updateColor(color.id, newColor)}
                      style={{ width: 100, height: 100 }}
                    />
                    <button
                      onClick={() => removeColor(color.id)}
                      disabled={colors.length <= 2}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity hover:bg-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {colors.length < 5 && (
                  <button
                    onClick={addColor}
                    className={`w-24 h-24 rounded-md flex items-center justify-center border-2 border-dashed transition-colors ${
                      isBgDark
                        ? "border-gray-600 hover:bg-gray-700"
                        : "border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    <span
                      className={`text-3xl font-light ${
                        isBgDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      +
                    </span>
                  </button>
                )}
              </div>
              <p
                className={`mt-3 text-sm ${
                  isBgDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Add 2-5 colors to create your custom palette. The generator will
                use these colors to create patterns.
              </p>

              {/* Category Selector */}
              <div className="mt-6">
                <h4 className={`text-md font-semibold mb-3 ${textColor}`}>
                  Select Pattern Type
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {ACTIVE_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        selectedCategory === category
                          ? "bg-indigo-600 text-white shadow-lg scale-105"
                          : isBgDark
                          ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                          : "bg-white hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-green-600 text-white font-bold py-4 px-4 rounded-lg shadow-lg hover:bg-green-700 disabled:bg-green-800 disabled:cursor-wait transition-colors"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  `Generate 10 ${selectedCategory} Patterns`
                )}
              </button>
              <div
                className={`text-xs text-center ${
                  isBgDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Generate 10 custom {selectedCategory.toLowerCase()} patterns using your color palette
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="text-center py-12">
            <div className="inline-block">
              <svg
                className="animate-spin h-12 w-12 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <p className={`mt-4 text-lg font-semibold ${textColor}`}>
              Creating your patterns...
            </p>
            <p
              className={`text-sm ${
                isBgDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              This may take a few seconds
            </p>
          </div>
        )}

        {/* Results */}
        {generatedPatterns.length > 0 && !isGenerating && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="space-y-4">
              <div className="flex justify-center flex-wrap gap-2">
                {FILTER_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                      activeCategory === cat
                        ? "bg-indigo-600 text-white shadow-lg scale-105"
                        : categoryBtnBase
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex justify-center flex-wrap gap-2">
                {THEME_FILTERS.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setActiveThemeFilter(theme)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full transition-all ${
                      activeThemeFilter === theme
                        ? "bg-gray-700 text-white scale-105"
                        : themeBtnBase
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            <p
              className={`text-center text-sm font-medium inline-block backdrop-blur-sm rounded-full px-4 py-1 ${countPillBase}`}
            >
              Showing {filteredPatterns.length} of {generatedPatterns.length}{" "}
              generated patterns
            </p>

            {/* Pattern Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPatterns.map((preset) => {
                const svgString = renderSVG({
                  canvas: preset.canvas,
                  layers: preset.layers,
                  selectedLayerId: null,
                } as any);
                const dataUrl = svgToDataUrl(svgString);

                return (
                  <div
                    key={preset.id}
                    onClick={() => handlePatternClick(preset)}
                    className="aspect-square rounded-xl shadow-lg overflow-hidden relative group cursor-pointer transform transition-transform hover:scale-105"
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
                          {preset.category}
                        </p>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedPatterns.length === 0 && !isGenerating && (
          <div
            className={`text-center backdrop-blur-sm rounded-lg p-12 ${emptyStateBg}`}
          >
            <svg
              className="w-20 h-20 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
            <h3 className={`text-xl font-semibold ${textColor}`}>
              Your patterns will appear here
            </h3>
            <p
              className={`mt-2 ${isBgDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Customize your color palette above and click "Generate" to create
              unique patterns
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default GeneratorPage;
