import React, { useState, useMemo, useEffect, Suspense, lazy } from "react";
import Hero from "./components/Hero";
import { renderSVG } from "./render/svgRenderer";
import type { Preset } from "./state/types";
import { getAverageLuminance } from "./utils/colorAnalyzer";
import { LayerType } from "./state/types";
import { presets } from "./presets";
import { useFavorites } from "./hooks/useFavorites";
import {
  useKeyboardShortcuts,
  commonShortcuts,
} from "./hooks/useKeyboardShortcuts";
import { useDebounce } from "./hooks/useDebounce";

// Lazy load components
const GeneratorView = lazy(() => import("./components/GeneratorView"));
const PatternLibrary = lazy(() => import("./components/PatternLibrary"));
const KeyboardShortcuts = lazy(() => import("./components/KeyboardShortcuts"));
const PatternMixer = lazy(() => import("./components/PatternMixer"));
const ComparisonView = lazy(() => import("./components/ComparisonView"));
const BatchExport = lazy(() => import("./components/BatchExport"));
const EnhancedExportModal = lazy(
  () => import("./components/EnhancedExportModal")
);

const App: React.FC = () => {
  const [view, setView] = useState<"hero" | "generator">("hero");
  const [backgroundStyle, setBackgroundStyle] = useState({});
  const [isBgDark, setIsBgDark] = useState(true);

  // Library state
  const [favorites, toggleFavorite] = useFavorites();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeThemeFilter, setActiveThemeFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  // NEW: Enhanced features state
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showPatternMixer, setShowPatternMixer] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showBatchExport, setShowBatchExport] = useState(false);
  const [showEnhancedExport, setShowEnhancedExport] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<Preset | null>(null);
  const [mixedPresets, setMixedPresets] = useState<Preset[]>([]);

  const filteredPresets = useMemo(() => {
    const allPresets = [...presets, ...mixedPresets];

    return allPresets.filter((p) => {
      if (activeCategory === "Favourites") {
        if (!favorites.includes(p.id)) return false;
      } else if (activeCategory !== "All" && p.category !== activeCategory) {
        return false;
      }

      const themeFilterLower = activeThemeFilter.toLowerCase();
      if (activeThemeFilter !== "All" && p.theme !== themeFilterLower) {
        return false;
      }

      if (
        debouncedSearch &&
        !p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [
    activeCategory,
    activeThemeFilter,
    debouncedSearch,
    favorites,
    presets,
    mixedPresets,
  ]);

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

    if (view === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    getAverageLuminance(svgString, preset.canvas.width, preset.canvas.height)
      .then((luminance) => setIsBgDark(luminance < 128))
      .catch(console.error);
  };

  const handleCreateMixed = (mixedPreset: Preset) => {
    setMixedPresets((prev) => [...prev, mixedPreset]);
    handlePreview(mixedPreset);
  };

  const navigatePattern = (direction: "next" | "prev") => {
    const currentIndex = filteredPresets.findIndex(
      (p) => p.id === currentPreset?.id
    );
    let newIndex;

    if (direction === "next") {
      newIndex = (currentIndex + 1) % filteredPresets.length;
    } else {
      newIndex =
        currentIndex - 1 < 0 ? filteredPresets.length - 1 : currentIndex - 1;
    }

    if (filteredPresets[newIndex]) {
      handlePreview(filteredPresets[newIndex]);
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    commonShortcuts.help(() => setShowKeyboardShortcuts(true)),
    commonShortcuts.escape(() => {
      setShowKeyboardShortcuts(false);
      setShowPatternMixer(false);
      setShowComparison(false);
      setShowBatchExport(false);
      setShowEnhancedExport(false);
    }),
    commonShortcuts.mixer(() => setShowPatternMixer(true)),
    commonShortcuts.export(() => currentPreset && setShowEnhancedExport(true)),
    commonShortcuts.comparison(() => setShowComparison(true)),
    commonShortcuts.favorite(() => {
      if (currentPreset) toggleFavorite(currentPreset.id);
    }),
    commonShortcuts.search(() => {
      const searchInput = document.querySelector(
        'input[type="search"]'
      ) as HTMLInputElement;
      searchInput?.focus();
    }),
    commonShortcuts.arrowLeft(() => navigatePattern("prev")),
    commonShortcuts.arrowRight(() => navigatePattern("next")),
    commonShortcuts.generator(() => setView("generator")),
    commonShortcuts.library(() => setView("hero")),
    commonShortcuts.copy(() => {
      if (currentPreset) {
        const svgString = renderSVG({
          canvas: currentPreset.canvas,
          layers: currentPreset.layers,
          selectedLayerId: null,
        } as any);
        const dataUrl = `data:image/svg+xml;base64,${btoa(
          unescape(encodeURIComponent(svgString))
        )}`;
        const cssCode = `.background {\n  background-image: url('${dataUrl}');\n  background-size: cover;\n  background-position: center;\n}`;
        navigator.clipboard.writeText(cssCode);
      }
    }),
  ]);

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

  useEffect(() => {
    handlePreview(initialPreset);
  }, []);

  const mainContent = () => {
    if (view === "generator") {
      return (
        <Suspense
          fallback={
            <div
              className="text-center p-12 text-2xl font-semibold text-white"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
            >
              Loading Generator...
            </div>
          }
        >
          <GeneratorView
            onPreview={handlePreview}
            isBgDark={isBgDark}
            onBack={() => setView("hero")}
          />
        </Suspense>
      );
    }

    return (
      <>
        <Hero
          isBgDark={isBgDark}
          onGenerateClick={() => setView("generator")}
          onMixerClick={() => setShowPatternMixer(true)}
          onBatchExportClick={() => setShowBatchExport(true)}
        />
        <Suspense
          fallback={
            <div
              className="text-center p-12 text-2xl font-semibold"
              style={{
                color: isBgDark ? "white" : "black",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              Loading Patterns...
            </div>
          }
        >
          <PatternLibrary
            presets={filteredPresets}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            activeThemeFilter={activeThemeFilter}
            onThemeFilterChange={setActiveThemeFilter}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onPreview={handlePreview}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            hasFavorites={favorites.length > 0}
            isBgDark={isBgDark}
            onOpenMixer={() => setShowPatternMixer(true)}
            onOpenComparison={() => setShowComparison(true)}
            onOpenBatchExport={() => setShowBatchExport(true)}
          />
        </Suspense>
      </>
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 w-full h-full"
        style={backgroundStyle}
        aria-hidden="true"
      />
      <div className="relative min-h-screen">{mainContent()}</div>

      <Suspense fallback={null}>
        <KeyboardShortcuts
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
        />
        {showPatternMixer ? (
          <PatternMixer
            isOpen={showPatternMixer}
            onClose={() => setShowPatternMixer(false)}
            presets={presets}
            onCreateMixed={handleCreateMixed}
          />
        ) : null}
        {showComparison ? (
          <ComparisonView
            isOpen={showComparison}
            onClose={() => setShowComparison(false)}
            presets={filteredPresets}
            initialPatterns={currentPreset ? [currentPreset] : []}
          />
        ) : null}
        {showBatchExport ? (
          <BatchExport
            isOpen={showBatchExport}
            onClose={() => setShowBatchExport(false)}
            presets={filteredPresets}
            favorites={favorites}
          />
        ) : null}
        {currentPreset && (
          <EnhancedExportModal
            isOpen={showEnhancedExport}
            onClose={() => setShowEnhancedExport(false)}
            svgString={renderSVG({
              canvas: currentPreset.canvas,
              layers: currentPreset.layers,
              selectedLayerId: null,
            } as any)}
            presetName={currentPreset.name}
            canvasWidth={currentPreset.canvas.width}
            canvasHeight={currentPreset.canvas.height}
          />
        )}
      </Suspense>

      <button
        onClick={() => setShowKeyboardShortcuts(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold transition-all hover:scale-110 z-30"
        aria-label="Show keyboard shortcuts (Press ?)"
        title="Keyboard Shortcuts (?)"
      >
        ?
      </button>

      {currentPreset && view === "hero" && (
        <div className="fixed bottom-8 left-8 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm z-30">
          <span className="opacity-75">Press </span>
          <kbd className="px-2 py-1 bg-white/20 rounded">←</kbd>
          <span className="opacity-75"> / </span>
          <kbd className="px-2 py-1 bg-white/20 rounded">→</kbd>
          <span className="opacity-75"> to navigate</span>
        </div>
      )}
    </>
  );
};

export default App;
