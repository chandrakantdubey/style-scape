// pages/MixerPage.tsx - Optimized with lazy loading
import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import SelectablePatternCard from "../components/SelectablePatternCard";
import type { Preset } from "../state/types";
import { renderSVG } from "../render/svgRenderer";

interface MixerPageProps {
  presets: Preset[];
  onCreateMixed: (preset: Preset) => void;
  onPreview: (preset: Preset) => void;
  isBgDark: boolean;
}

const MixerPage: React.FC<MixerPageProps> = ({
  presets,
  onCreateMixed,
  onPreview,
  isBgDark,
}) => {
  const navigate = useNavigate();
  const [selectedPatterns, setSelectedPatterns] = useState<Preset[]>([]);
  const [blendMode, setBlendMode] = useState("overlay");
  const [opacity, setOpacity] = useState(0.6);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const blendModes = [
    "normal",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "color-dodge",
    "color-burn",
    "hard-light",
    "soft-light",
  ];

  const filteredPresets = useMemo(() => {
    return presets
      .filter((p) => {
        const matchesSearch = p.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCategory =
          categoryFilter === "All" || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .slice(0, 50); // Limit to 50 for performance
  }, [presets, searchTerm, categoryFilter]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(presets.map((p) => p.category)))],
    [presets]
  );

  const toggleSelection = useCallback(
    (preset: Preset) => {
      setSelectedPatterns((prev) => {
        const isSelected = prev.find((p) => p.id === preset.id);
        if (isSelected) {
          return prev.filter((p) => p.id !== preset.id);
        } else if (prev.length < 4) {
          return [...prev, preset];
        }
        return prev;
      });
    },
    []
  );

  const previewMixed = useMemo(() => {
    if (selectedPatterns.length === 0) return null;

    const mixedLayers = selectedPatterns.flatMap((preset, index) => {
      if (index === 0) {
        // First pattern: keep all layers as-is
        return preset.layers.map(layer => ({
          ...layer,
          id: `preview-${layer.id}-${index}`,
          name: `${preset.name} - ${layer.name}`,
        }));
      } else {
        // Additional patterns: apply blend mode to ALL layers for strong blending effect
        return preset.layers.map((layer, layerIndex) => ({
          ...layer,
          id: `preview-${layer.id}-${index}-${layerIndex}`,
          name: `${preset.name} - ${layer.name}`,
          blendMode: blendMode, // Apply to all layers
          opacity: layer.opacity * opacity, // Combine original opacity with global opacity
        }));
      }
    });

    const tempPreset = {
      canvas: selectedPatterns[0].canvas,
      layers: mixedLayers,
      selectedLayerId: null,
    };

    const svgString = renderSVG(tempPreset as any);
    return `data:image/svg+xml;base64,${btoa(
      unescape(encodeURIComponent(svgString))
    )}`;
  }, [selectedPatterns, blendMode, opacity]);

  const createMixedPattern = () => {
    if (selectedPatterns.length < 2) return;

    const mixedLayers = selectedPatterns.flatMap((preset, index) => {
      if (index === 0) {
        // First pattern: keep all layers as-is
        return preset.layers.map(layer => ({
          ...layer,
          id: `mixed-${layer.id}-${index}`,
          name: `${preset.name} - ${layer.name}`,
        }));
      } else {
        // Additional patterns: apply blend mode to ALL layers for strong blending effect
        return preset.layers.map((layer, layerIndex) => ({
          ...layer,
          id: `mixed-${layer.id}-${index}-${layerIndex}`,
          name: `${preset.name} - ${layer.name}`,
          blendMode: blendMode, // Apply to all layers
          opacity: layer.opacity * opacity, // Combine original opacity with global opacity
        }));
      }
    });

    const mixedPreset: Preset = {
      id: `mixed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Mixed: ${selectedPatterns.map((p) => p.name).join(" + ")}`,
      category: "Mixed",
      theme: selectedPatterns[0].theme,
      isNew: true,
      canvas: selectedPatterns[0].canvas,
      layers: mixedLayers,
    };

    onCreateMixed(mixedPreset);
    onPreview(mixedPreset);
    navigate("/");
  };

  const textColor = isBgDark ? "text-white" : "text-gray-900";
  const bgPanel = isBgDark ? "bg-gray-900/80" : "bg-white/80";
  const borderColor = isBgDark ? "border-gray-700" : "border-gray-300";

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
                Pattern Mixer
              </h1>
              <p
                className={`text-sm mt-1 ${
                  isBgDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Select 2-4 patterns • {selectedPatterns.length}/4 selected
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
        {/* Selected Patterns and Create Button - Top Section */}
        <div className="space-y-6">
          {/* Selected Patterns */}
          {selectedPatterns.length > 0 && (
            <div
              className={`${bgPanel} backdrop-blur-lg rounded-xl border ${borderColor} p-6`}
            >
              <h3 className={`text-lg font-semibold mb-3 ${textColor}`}>
                Selected Patterns ({selectedPatterns.length}/4)
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedPatterns.map((preset, index) => (
                  <span
                    key={preset.id}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                      isBgDark
                        ? "bg-gray-800 text-gray-300"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    <span className="font-medium">{index + 1}.</span>
                    {preset.name}
                    <button
                      onClick={() => toggleSelection(preset)}
                      className="text-red-500 hover:text-red-600 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mix Controls */}
          {selectedPatterns.length >= 2 && (
            <div
              className={`${bgPanel} backdrop-blur-lg rounded-xl border ${borderColor} p-6 space-y-6`}
            >
              <h3 className={`text-lg font-semibold ${textColor}`}>
                Mixing Settings
              </h3>

              {/* Blend Mode */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                  Blend Mode
                </label>
                <select
                  value={blendMode}
                  onChange={(e) => setBlendMode(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${
                    isBgDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  {blendModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode.charAt(0).toUpperCase() +
                        mode.slice(1).replace("-", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Opacity */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                  Layer Opacity: {Math.round(opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Preview */}
              {previewMixed && (
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${textColor}`}
                  >
                    Preview
                  </label>
                  <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url("${previewMixed}")` }}
                    />
                  </div>
                </div>
              )}

              {/* Create Button */}
              <button
                onClick={createMixedPattern}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Create Mixed Pattern
              </button>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div
          className={`${bgPanel} backdrop-blur-lg rounded-xl border ${borderColor} p-6 space-y-4`}
        >
          <input
            type="search"
            placeholder="Search patterns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${
              isBgDark
                ? "bg-gray-800 text-white placeholder-gray-500"
                : "bg-white text-gray-900 placeholder-gray-400"
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  categoryFilter === cat
                    ? "bg-indigo-600 text-white"
                    : isBgDark
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Pattern Grid */}
        <div
          className={`${bgPanel} backdrop-blur-lg rounded-xl border ${borderColor} p-6`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>
            Available Patterns ({filteredPresets.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredPresets.map((preset) => {
              const isSelected = selectedPatterns.find(
                (p) => p.id === preset.id
              );

              return (
                <SelectablePatternCard
                  key={preset.id}
                  preset={preset}
                  onPreview={onPreview}
                  isSelected={!!isSelected}
                  selectionIndex={isSelected ? selectedPatterns.findIndex((p) => p.id === preset.id) : undefined}
                  onToggleSelection={() => toggleSelection(preset)}
                  disabled={!isSelected && selectedPatterns.length >= 4}
                />
              );
            })}
          </div>
        </div>

        {selectedPatterns.length === 1 && (
          <div
            className={`${bgPanel} backdrop-blur-lg rounded-xl border ${borderColor} p-8 text-center`}
          >
            <p className={isBgDark ? "text-gray-400" : "text-gray-600"}>
              Select at least one more pattern to start mixing
            </p>
          </div>
        )}

        {selectedPatterns.length === 0 && (
          <div
            className={`${bgPanel} backdrop-blur-lg rounded-xl border ${borderColor} p-8 text-center`}
          >
            <p className={isBgDark ? "text-gray-400" : "text-gray-600"}>
              Select 2-4 patterns to blend them together
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MixerPage;
