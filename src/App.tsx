import React, { useState, useMemo, useEffect, Suspense, lazy } from "react";
import { useTheme } from "./hooks/useTheme";
import { useFavorites } from "./hooks/useFavorites";
import type { Preset } from "./state/types";
import { renderSVG } from "./render/svgRenderer";
import { presets } from "./presets";
import Hero from "./components/Hero";

const PatternLibrary = lazy(() => import("./components/PatternLibrary"));

const App: React.FC = () => {
  const [theme, toggleTheme] = useTheme();
  const [favorites, toggleFavorite] = useFavorites();
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [backgroundStyle, setBackgroundStyle] = useState({});

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
  };

  useEffect(() => {
    // Set a default background on initial load
    if (presets.length > 0) {
      handlePreview(presets[Math.floor(Math.random() * presets.length)]);
    }
  }, []);

  const filteredPresets = useMemo(() => {
    let initialFilter = presets;
    if (category === "Favourites") {
      initialFilter = presets.filter((p) => favorites.includes(p.id));
    } else if (category !== "All") {
      initialFilter = presets.filter((p) => p.category === category);
    }

    return initialFilter.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [category, searchTerm, favorites]);

  return (
    <>
      <div
        className="fixed inset-0 w-full h-full"
        style={backgroundStyle}
        aria-hidden="true"
      />
      <div className="relative min-h-screen">
        <Hero theme={theme} onToggleTheme={toggleTheme} />
        <Suspense
          fallback={
            <div
              className="text-center p-12 text-2xl font-semibold text-white"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
            >
              Loading Patterns...
            </div>
          }
        >
          <PatternLibrary
            presets={filteredPresets}
            activeCategory={category}
            onCategoryChange={setCategory}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onPreview={handlePreview}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            hasFavorites={favorites.length > 0}
          />
        </Suspense>
      </div>
    </>
  );
};

export default App;
