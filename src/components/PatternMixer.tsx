// components/PatternMixer.tsx - FIXED VERSION
import React, { useState, useMemo } from "react";
import type { Preset } from "../state/types";
import { renderSVG } from "../render/svgRenderer";
import { CloseIcon } from "./Icons";

interface PatternMixerProps {
  isOpen: boolean;
  onClose: () => void;
  presets: Preset[];
  onCreateMixed: (mixedPreset: Preset) => void;
}

const PatternMixer: React.FC<PatternMixerProps> = ({
  isOpen,
  onClose,
  presets,
  onCreateMixed,
}) => {
  // FIX: Move all hooks to the top, before any conditional returns
  const [selectedPatterns, setSelectedPatterns] = useState<Preset[]>([]);
  const [blendMode, setBlendMode] = useState<string>("overlay");
  const [opacity, setOpacity] = useState(0.6);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

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
    "difference",
    "exclusion",
    "hue",
    "saturation",
    "color",
    "luminosity",
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
      .slice(0, 20);
  }, [presets, searchTerm, categoryFilter]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(presets.map((p) => p.category)))],
    [presets]
  );

  const previewMixed = useMemo(() => {
    if (selectedPatterns.length === 0) return null;

    const mixedLayers = selectedPatterns.flatMap((preset, index) =>
      preset.layers.map((layer) => ({
        ...layer,
        id: `preview-${layer.id}-${index}`,
        blendMode: index === 0 ? "normal" : blendMode,
        opacity: index === 0 ? 1 : opacity,
      }))
    );

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

  // NOW it's safe to return early
  if (!isOpen) return null;

  const toggleSelection = (id: string) => {
    setSelectedPatterns((prev) =>
      prev.find((p) => p.id === id)
        ? prev.filter((p) => p.id !== id)
        : prev.length < 4
        ? [...prev, presets.find((p) => p.id === id)!]
        : prev
    );
  };

  const selectAll = () => {
    setSelectedPatterns(filteredPresets.slice(0, 4));
  };

  const deselectAll = () => {
    setSelectedPatterns([]);
  };

  const createMixedPattern = () => {
    if (selectedPatterns.length < 2) return;

    const mixedLayers = selectedPatterns.flatMap((preset, index) =>
      preset.layers.map((layer) => ({
        ...layer,
        id: `mixed-${layer.id}-${index}`,
        name: `${preset.name} - ${layer.name}`,
        blendMode: index === 0 ? "normal" : blendMode,
        opacity: index === 0 ? 1 : opacity,
      }))
    );

    const mixedPreset: Preset = {
      id: `mixed-${Date.now()}`,
      name: `Mixed: ${selectedPatterns.map((p) => p.name).join(" + ")}`,
      category: "Abstract",
      theme: selectedPatterns[0].theme,
      isNew: true,
      canvas: selectedPatterns[0].canvas,
      layers: mixedLayers,
    };

    onCreateMixed(mixedPreset);
    setSelectedPatterns([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-auto shadow-2xl my-4">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pattern Mixer
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Select 2-4 patterns to blend together ({selectedPatterns.length}
                /4 selected)
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Search and Filter */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search patterns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    categoryFilter === cat
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={selectAll}
                disabled={filteredPresets.length === 0}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select First 4
              </button>
              <button
                onClick={deselectAll}
                disabled={selectedPatterns.length === 0}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Pattern Selection Grid */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Select Patterns
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-2">
              {filteredPresets.map((preset) => {
                const svgString = renderSVG({
                  canvas: preset.canvas,
                  layers: preset.layers,
                  selectedLayerId: null,
                } as any);
                const dataUrl = `data:image/svg+xml;base64,${btoa(
                  unescape(encodeURIComponent(svgString))
                )}`;
                const isSelected = selectedPatterns.find(
                  (p) => p.id === preset.id
                );

                return (
                  <button
                    key={preset.id}
                    onClick={() => toggleSelection(preset.id)}
                    disabled={!isSelected && selectedPatterns.length >= 4}
                    className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                      isSelected
                        ? "ring-4 ring-indigo-500 scale-95"
                        : "hover:scale-105 hover:shadow-lg"
                    } ${
                      !isSelected && selectedPatterns.length >= 4
                        ? "opacity-30 cursor-not-allowed"
                        : ""
                    }`}
                    title={preset.name}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url("${dataUrl}")` }}
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {selectedPatterns.findIndex((p) => p.id === preset.id) +
                          1}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Patterns Summary */}
          {selectedPatterns.length > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                Selected Patterns:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedPatterns.map((preset, index) => (
                  <span
                    key={preset.id}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="font-medium">{index + 1}.</span>
                    {preset.name}
                    <button
                      onClick={() => toggleSelection(preset.id)}
                      className="text-gray-400 hover:text-red-500 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mixing Controls */}
          {selectedPatterns.length >= 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Mixing Settings
              </h3>

              {/* Blend Mode */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Blend Mode
                </label>
                <select
                  value={blendMode}
                  onChange={(e) => setBlendMode(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
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
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Transparent</span>
                  <span>Opaque</span>
                </div>
              </div>

              {/* Preview */}
              {previewMixed && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
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
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Mixed Pattern
              </button>
            </div>
          )}

          {selectedPatterns.length === 1 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Select at least one more pattern to start mixing
              </p>
            </div>
          )}

          {selectedPatterns.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Select 2-4 patterns to blend them together
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatternMixer;
