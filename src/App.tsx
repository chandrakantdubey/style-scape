// App.tsx - React Router Version
import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { renderSVG } from "./render/svgRenderer";
import { getAverageLuminance } from "./utils/colorAnalyzer";
import { LayerType } from "./state/types";
import type { Preset } from "./state/types";
import { presets } from "./presets";
import { useFavorites } from "./hooks/useFavorites";
import {
  useKeyboardShortcuts,
  commonShortcuts,
} from "./hooks/useKeyboardShortcuts";

// Zustand store
import useStore from "./state/store";

// Pages
import HomePage from "./pages/HomePage";
import GeneratorPage from "./pages/GeneratorPage";
import MixerPage from "./pages/MixerPage";
import BatchExportPage from "./pages/BatchExportPage";
import ComparisonPage from "./pages/ComparisonPage";
import PatternDetailPage from "./pages/PatternDetailPage";

// Components
import HelpWidget from "./components/HelpWidget";

const App: React.FC = () => {
  const [backgroundStyle, setBackgroundStyle] = useState({});
  const [isBgDark, setIsBgDark] = useState(true);
  const [_currentPreset, setCurrentPreset] = useState<Preset | null>(null);
  const [favorites, toggleFavorite] = useFavorites();

  // Use Zustand store for user-created presets
  const { addUserCreatedPreset, getUserCreatedPresets } = useStore();
  const [userCreatedPresets, setUserCreatedPresets] = useState<Preset[]>(() => getUserCreatedPresets());

  // Make allPresets reactive to userCreatedPresets changes
  const allPresets = useMemo(() => [...presets, ...userCreatedPresets], [userCreatedPresets]);

  // Track current background pattern index for keyboard navigation
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  const handlePreview = (preset: Preset) => {
    const svgString = renderSVG({
      canvas: preset.canvas,
      layers: preset.layers,
      selectedLayerId: null,
    } as any);

    const svgDataUrl = `url("data:image/svg+xml,${encodeURIComponent(
      svgString
    )}")`;
    setBackgroundStyle({
      backgroundImage: svgDataUrl,
      backgroundSize: "cover",
      backgroundPosition: "center",
      transition: "background-image 0.3s ease-in-out",
    });

    setCurrentPreset(preset);

    // Update current background index
    const presetIndex = allPresets.findIndex(p => p.id === preset.id);
    if (presetIndex !== -1) {
      setCurrentBgIndex(presetIndex);
    }

    getAverageLuminance(svgString, preset.canvas.width, preset.canvas.height)
      .then((luminance) => setIsBgDark(luminance < 128))
      .catch(console.error);
  };

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

  const handleCreateMixed = (mixedPreset: Preset) => {
    addUserCreatedPreset(mixedPreset);
    setUserCreatedPresets(prev => [...prev, mixedPreset]);
    handlePreview(mixedPreset);
  };

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
    handlePreview(initialPreset);
  }, []);

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

      {/* Main Content */}
      <div className="relative min-h-screen">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                presets={presets}
                userCreatedPresets={userCreatedPresets}
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
            path="/mixer"
            element={
              <MixerPage
                presets={allPresets}
                onCreateMixed={handleCreateMixed}
                onPreview={handlePreview}
                isBgDark={isBgDark}
              />
            }
          />
          <Route
            path="/batch-export"
            element={
              <BatchExportPage
                presets={allPresets}
                favorites={favorites}
                isBgDark={isBgDark}
              />
            }
          />
          <Route
            path="/compare"
            element={
              <ComparisonPage
                presets={allPresets}
                onPreview={handlePreview}
                isBgDark={isBgDark}
              />
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

        {/* Help Widget */}
        <HelpWidget isBgDark={isBgDark} />
      </div>
    </BrowserRouter>
  );
};

export default App;
