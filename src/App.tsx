// App.tsx - React Router Version
import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { renderSVG } from "./render/svgRenderer";
import { svgToDataUrl } from "./render/svgUtils";
import { getAverageLuminance } from "./utils/colorAnalyzer";
import type { Preset } from "./state/types";
import { presets } from "./presets";
import { isActiveCategory } from "./presets/catalog";
import { useFavorites } from "./hooks/useFavorites";
import {
  useKeyboardShortcuts,
  commonShortcuts,
} from "./hooks/useKeyboardShortcuts";

import useStore, { USER_PRESETS_UPDATED_EVENT } from "./state/store";

const HomePage = lazy(() => import("./pages/HomePage"));
const GeneratorPage = lazy(() => import("./pages/GeneratorPage"));
const PatternDetailPage = lazy(() => import("./pages/PatternDetailPage"));

const RouteFallback = () => (
  <div className="min-h-screen grid place-items-center">
    <div className="rounded-lg border border-white/15 bg-gray-950/70 px-5 py-3 text-sm font-medium text-white shadow-xl backdrop-blur-md">
      Loading...
    </div>
  </div>
);

const App: React.FC = () => {
  const [backgroundStyle, setBackgroundStyle] = useState({});
  const [isBgDark, setIsBgDark] = useState(true);
  const [favorites, toggleFavorite] = useFavorites();

  const { getUserCreatedPresets } = useStore();
  const [userCreatedPresets, setUserCreatedPresets] = useState<Preset[]>(() => getUserCreatedPresets());
  const validUserCreatedPresets = useMemo(
    () => userCreatedPresets.filter((preset) => isActiveCategory(preset.category)),
    [userCreatedPresets]
  );
  const allPresets = useMemo(() => [...presets, ...validUserCreatedPresets], [validUserCreatedPresets]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  const applyPreview = useCallback((preset: Preset) => {
    const svgString = renderSVG({
      canvas: preset.canvas,
      layers: preset.layers,
      selectedLayerId: null,
    } as any);

    const svgDataUrl = `url("${svgToDataUrl(svgString)}")`;
    setBackgroundStyle({
      backgroundImage: svgDataUrl,
      backgroundSize: "cover",
      backgroundPosition: "center",
      transition: "background-image 0.3s ease-in-out",
    });

    getAverageLuminance(svgString, preset.canvas.width, preset.canvas.height)
      .then((luminance) => setIsBgDark(luminance < 128))
      .catch(console.error);
  }, []);

  const handlePreview = useCallback((preset: Preset) => {
    applyPreview(preset);

    const presetIndex = allPresets.findIndex(p => p.id === preset.id);
    if (presetIndex !== -1) {
      setCurrentBgIndex(presetIndex);
    }
  }, [allPresets, applyPreview]);

  // Handlers for cycling through background patterns
  const cycleBackgroundNext = () => {
    if (allPresets.length === 0) return;
    const nextIndex = (currentBgIndex + 1) % allPresets.length;
    setCurrentBgIndex(nextIndex);
    handlePreview(allPresets[nextIndex]);
  };

  const cycleBackgroundPrev = () => {
    if (allPresets.length === 0) return;
    const prevIndex = currentBgIndex === 0 ? allPresets.length - 1 : currentBgIndex - 1;
    setCurrentBgIndex(prevIndex);
    handlePreview(allPresets[prevIndex]);
  };

  useEffect(() => {
    const syncUserPresets = () => {
      setUserCreatedPresets(getUserCreatedPresets());
    };

    window.addEventListener(USER_PRESETS_UPDATED_EVENT, syncUserPresets);
    return () => window.removeEventListener(USER_PRESETS_UPDATED_EVENT, syncUserPresets);
  }, [getUserCreatedPresets]);

  // Initialize with default background
  useEffect(() => {
    if (allPresets.length > 0) {
      applyPreview(allPresets[0]);
    }
  }, [applyPreview, allPresets]);

  // Global keyboard shortcuts
  useKeyboardShortcuts([
    commonShortcuts.escape(() => window.history.back()),
    commonShortcuts.search(() => {
      const searchInput = document.querySelector(
        'input[type="search"]'
      ) as HTMLInputElement;
      searchInput?.focus();
    }),
    commonShortcuts.arrowLeft(cycleBackgroundPrev),
    commonShortcuts.arrowRight(cycleBackgroundNext),
  ]);

  return (
    <BrowserRouter>
      {/* Fixed Background Layer */}
      <div
        className="fixed inset-0 w-full h-full -z-10"
        style={backgroundStyle}
        aria-hidden="true"
      />

      <div className="relative min-h-screen">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  presets={presets}
                  userCreatedPresets={validUserCreatedPresets}
                  onPreview={handlePreview}
                  isBgDark={isBgDark}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              }
            />
            <Route
              path="/generator"
              element={
                <GeneratorPage onPreview={handlePreview} isBgDark={isBgDark} />
              }
            />
            <Route
              path="/pattern/:id"
              element={
                <PatternDetailPage
                  presets={allPresets}
                  onPreview={handlePreview}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  isBgDark={isBgDark}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        {/* Floating Background Cycle Widget */}
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 p-2 rounded-full backdrop-blur-md border ${
          isBgDark
            ? "bg-gray-950/85 border-white/10 text-white shadow-black/40"
            : "bg-white/85 border-gray-200 text-gray-800 shadow-gray-200/40"
        } shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105`}>
          {/* Left Arrow Button */}
          <button
            onClick={cycleBackgroundPrev}
            className={`p-2 rounded-full transition-colors ${
              isBgDark
                ? "hover:bg-white/10 text-gray-300 hover:text-white"
                : "hover:bg-black/5 text-gray-600 hover:text-gray-900"
            }`}
            title="Previous Background Pattern (Arrow Left)"
            aria-label="Previous background"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Current Preset Info */}
          <div className="px-2 text-xs font-semibold select-none max-w-[150px] truncate text-center">
            {allPresets[currentBgIndex]?.name || "Initial Background"}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={cycleBackgroundNext}
            className={`p-2 rounded-full transition-colors ${
              isBgDark
                ? "hover:bg-white/10 text-gray-300 hover:text-white"
                : "hover:bg-black/5 text-gray-600 hover:text-gray-900"
            }`}
            title="Next Background Pattern (Arrow Right)"
            aria-label="Next background"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
