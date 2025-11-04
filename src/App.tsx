// App.tsx - React Router Version
import React, { useState, useEffect } from "react";
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

// Pages
import HomePage from "./pages/HomePage";
import GeneratorPage from "./pages/GeneratorPage";
import MixerPage from "./pages/MixerPage";
import BatchExportPage from "./pages/BatchExportPage";
import ComparisonPage from "./pages/ComparisonPage";
import PatternDetailPage from "./pages/PatternDetailPage";

const App: React.FC = () => {
  const [backgroundStyle, setBackgroundStyle] = useState({});
  const [isBgDark, setIsBgDark] = useState(true);
  const [currentPreset, setCurrentPreset] = useState<Preset | null>(null);
  const [favorites, toggleFavorite] = useFavorites();
  const [mixedPresets, setMixedPresets] = useState<Preset[]>([]);

  const allPresets = [...presets, ...mixedPresets];

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

    getAverageLuminance(svgString, preset.canvas.width, preset.canvas.height)
      .then((luminance) => setIsBgDark(luminance < 128))
      .catch(console.error);
  };

  const handleCreateMixed = (mixedPreset: Preset) => {
    setMixedPresets((prev) => [...prev, mixedPreset]);
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
                presets={allPresets}
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
      </div>
    </BrowserRouter>
  );
};

export default App;
