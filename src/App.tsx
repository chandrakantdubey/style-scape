import { useState, useMemo, useEffect, Suspense, lazy, type FC } from "react";
import Hero from "./components/Hero";
import { presets } from "./presets";
import { renderSVG } from "./render/svgRenderer";
import type { Preset } from "./state/types";
import { useTheme } from "./hooks/useTheme";
import { useFavorites } from "./hooks/useFavorites";
import { getAverageLuminance } from "./utils/colorAnalyzer";

const PatternLibrary = lazy(() => import("./components/PatternLibrary"));
const CustomizeModal = lazy(() => import("./components/CustomizeModal"));

const App: FC = () => {
  const [theme, toggleTheme] = useTheme();
  const [favorites, toggleFavorite] = useFavorites();
  const [category, setCategory] = useState("All");
  const [themeFilter, setThemeFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [backgroundStyle, setBackgroundStyle] = useState({});
  const [isBgDark, setIsBgDark] = useState(true);
  const [customizingPreset, setCustomizingPreset] = useState<Preset | null>(
    null
  );

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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    getAverageLuminance(svgString, preset.canvas.width, preset.canvas.height)
      .then((luminance) => {
        setIsBgDark(luminance < 128);
      })
      .catch(console.error);
  };

  useEffect(() => {
    // Set a default background on initial load
    if (presets.length > 0) {
      handlePreview(presets[Math.floor(Math.random() * presets.length)]);
    }
  }, []);

  const filteredPresets = useMemo(() => {
    let results = presets;

    // Filter by Category
    if (category === "Favourites") {
      results = results.filter((p) => favorites.includes(p.id));
    } else if (category !== "All") {
      results = results.filter((p) => p.category === category);
    }

    // Filter by Theme
    if (themeFilter !== "All") {
      results = results.filter((p) => p.theme === themeFilter.toLowerCase());
    }

    // Filter by Search Term
    return results.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [category, themeFilter, searchTerm, favorites]);

  return (
    <>
      <div
        className="fixed inset-0 w-full h-full"
        style={backgroundStyle}
        aria-hidden="true"
      />
      <div className="relative min-h-screen">
        <Hero theme={theme} onToggleTheme={toggleTheme} isBgDark={isBgDark} />
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
            activeThemeFilter={themeFilter}
            onThemeFilterChange={setThemeFilter}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onPreview={handlePreview}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onCustomize={setCustomizingPreset}
            hasFavorites={favorites.length > 0}
            isBgDark={isBgDark}
          />
        </Suspense>
        {customizingPreset && (
          <Suspense fallback={<div />}>
            <CustomizeModal
              preset={customizingPreset}
              onClose={() => setCustomizingPreset(null)}
            />
          </Suspense>
        )}
      </div>
    </>
  );
};

export default App;
