// App.tsx - React Router Version
import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { renderSVG } from "./render/svgRenderer";
import { svgToDataUrl } from "./render/svgUtils";
import { getAverageLuminance } from "./utils/colorAnalyzer";
import { LayerType } from "./state/types";
import type { Preset } from "./state/types";
import { presets } from "./presets";
import { isActiveCategory } from "./presets/catalog";
import { useFavorites } from "./hooks/useFavorites";
import {
  useKeyboardShortcuts,
  commonShortcuts,
} from "./hooks/useKeyboardShortcuts";

import useStore, { USER_PRESETS_UPDATED_EVENT } from "./state/store";
import HelpWidget from "./components/HelpWidget";

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
    const initialPreset: Preset = {
      id: "initial-bg",
      name: "Initial Background",
      category: "Gradients",
      theme: "dark",
      canvas: { width: 1920, height: 1080, background: "#030712" },
      layers: [
        {
          id: "layer-initial-1",
          name: "Initial Gradient",
          type: LayerType.GRADIENT,
          visible: true,
          opacity: 0.8,
          blendMode: "overlay",
          gradientType: "radial",
          angle: 145,
          stops: [
            { id: "s1", color: "#4f46e5", offset: 0 },
            { id: "s2", color: "#1e1b4b", offset: 100 },
          ],
          cx: 20,
          cy: 30,
          r: 70,
        },
      ],
    };
    applyPreview(initialPreset);
  }, [applyPreview]);

  // Global keyboard shortcuts
  useKeyboardShortcuts([
    commonShortcuts.escape(() => window.history.back()),
    commonShortcuts.search(() => {
      const searchInput = document.querySelector(
        'input[type="search"]'
      ) as HTMLInputElement;
      searchInput?.focus();
    }),
    commonShortcuts.help(() => {
      // Dispatch a custom event to open the help modal
      const event = new KeyboardEvent("keydown", {
        key: "?",
        shiftKey: true,
      });
      window.dispatchEvent(event);
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

        <HelpWidget isBgDark={isBgDark} />
      </div>
    </BrowserRouter>
  );
};

export default App;
