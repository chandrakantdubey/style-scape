import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import type { Preset } from "../state/types";
import { renderSVG } from "../render/svgRenderer";
import { CopyIcon, CheckIcon } from "../components/Icons";

interface ComparisonPageProps {
  presets: Preset[];
  onPreview: (preset: Preset) => void;
  isBgDark: boolean;
}

const ComparisonPage: React.FC<ComparisonPageProps> = ({
  presets,
  onPreview,
  isBgDark,
}) => {
  const navigate = useNavigate();
  const [selectedPatterns, setSelectedPatterns] = useState<Preset[]>(
    presets.slice(0, 2)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"split" | "grid">("split");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const filteredPresets = useMemo(() => {
    return presets
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 20);
  }, [presets, searchTerm]);

  const replacePattern = (index: number, newPattern: Preset) => {
    const updated = [...selectedPatterns];
    updated[index] = newPattern;
    setSelectedPatterns(updated);
  };

  const handleCopyCode = (pattern: Preset, index: number) => {
    const svgString = renderSVG({
      canvas: pattern.canvas,
      layers: pattern.layers,
      selectedLayerId: null,
    } as any);
    const dataUrl = `data:image/svg+xml;base64,${btoa(
      unescape(encodeURIComponent(svgString))
    )}`;
    const cssCode = `.background {\n  background-image: url('${dataUrl}');\n  background-size: cover;\n  background-position: center;\n}`;
    navigator.clipboard.writeText(cssCode);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const textColor = isBgDark ? "text-white" : "text-gray-900";
  const bgPanel = isBgDark ? "bg-gray-900/80" : "bg-white/80";
  const borderColor = isBgDark ? "border-gray-700" : "border-gray-300";

  const gridCols =
    selectedPatterns.length === 2
      ? "grid-cols-2"
      : selectedPatterns.length === 3
      ? "grid-cols-3"
      : "grid-cols-2 md:grid-cols-4";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className={`${bgPanel} backdrop-blur-lg border-b ${borderColor}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${textColor}`}>
                Pattern Comparison
              </h1>
              <p
                className={`text-sm mt-1 ${
                  isBgDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Compare up to 4 patterns side by side
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-800 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("split")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "split"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Split
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "grid"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Grid
                </button>
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
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Comparison Area */}
        <div className="flex-1 p-6">
          <div className={`h-full grid ${gridCols} gap-4`}>
            {selectedPatterns.map((pattern, index) => {
              const svgString = renderSVG({
                canvas: pattern.canvas,
                layers: pattern.layers,
                selectedLayerId: null,
              } as any);
              const dataUrl = `data:image/svg+xml;base64,${btoa(
                unescape(encodeURIComponent(svgString))
              )}`;

              return (
                <div
                  key={index}
                  className="relative h-full min-h-[400px] rounded-xl overflow-hidden group"
                  style={{
                    backgroundImage: `url("${dataUrl}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Pattern Info Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                      <div>
                        <h3 className="text-white font-bold text-lg">
                          {pattern.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                          <span>{pattern.category}</span>
                          <span>•</span>
                          <span className="capitalize">{pattern.theme}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyCode(pattern, index)}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            copiedIndex === index
                              ? "bg-green-600 text-white"
                              : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
                          }`}
                        >
                          {copiedIndex === index ? (
                            <>
                              <CheckIcon className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <CopyIcon className="w-4 h-4" />
                              Copy CSS
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            onPreview(pattern);
                            navigate(`/pattern/${pattern.id}`);
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>

                    {/* Position Indicator */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pattern Selection Sidebar */}
        <div
          className={`w-80 ${bgPanel} backdrop-blur-lg border-l ${borderColor} overflow-auto flex-shrink-0`}
        >
          <div className="p-4 space-y-4">
            <div>
              <h3 className={`text-lg font-semibold ${textColor} mb-3`}>
                Select Patterns
              </h3>

              {/* Search */}
              <input
                type="search"
                placeholder="Search patterns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${
                  isBgDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                } text-sm`}
              />
            </div>

            {/* Current Selections */}
            <div>
              <h4
                className={`text-sm font-medium ${
                  isBgDark ? "text-gray-400" : "text-gray-600"
                } mb-2`}
              >
                Currently Comparing ({selectedPatterns.length}/4)
              </h4>
              <div className="space-y-2">
                {selectedPatterns.map((pattern, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      isBgDark ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <div className="flex-shrink-0 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className={`text-sm truncate flex-1 ${textColor}`}>
                      {pattern.name}
                    </span>
                  </div>
                ))}
                {selectedPatterns.length < 4 && (
                  <div
                    className={`text-xs italic p-2 ${
                      isBgDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Select up to {4 - selectedPatterns.length} more patterns
                  </div>
                )}
              </div>
            </div>

            {/* Available Patterns */}
            <div>
              <h4
                className={`text-sm font-medium ${
                  isBgDark ? "text-gray-400" : "text-gray-600"
                } mb-2`}
              >
                Available Patterns
              </h4>
              <div className="grid grid-cols-2 gap-2">
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
                      onClick={() => {
                        if (isSelected) {
                          setSelectedPatterns(
                            selectedPatterns.filter((p) => p.id !== preset.id)
                          );
                        } else if (selectedPatterns.length < 4) {
                          setSelectedPatterns([...selectedPatterns, preset]);
                        } else {
                          // Replace the last pattern
                          replacePattern(selectedPatterns.length - 1, preset);
                        }
                      }}
                      className={`aspect-square rounded-lg overflow-hidden transition-all hover:scale-105 ${
                        isSelected ? "ring-2 ring-indigo-500" : ""
                      }`}
                      title={preset.name}
                    >
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url("${dataUrl}")` }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;
