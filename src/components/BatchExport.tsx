// components/BatchExport.tsx - FIXED VERSION
import React, { useState, useMemo } from "react";
import type { Preset } from "../state/types";
import { renderSVG } from "../render/svgRenderer";
import { CloseIcon, CheckIcon } from "./Icons";

interface BatchExportProps {
  isOpen: boolean;
  onClose: () => void;
  presets: Preset[];
  favorites: string[];
}

type ExportFormat = "svg" | "png" | "css" | "json";

const BatchExport: React.FC<BatchExportProps> = ({
  isOpen,
  onClose,
  presets,
  favorites,
}) => {
  // FIX: All hooks at the top before any conditional returns
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [format, setFormat] = useState<ExportFormat>("svg");
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const filteredPresets = useMemo(() => {
    return presets.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || p.category === categoryFilter;
      const matchesFavorites =
        categoryFilter === "Favorites" ? favorites.includes(p.id) : true;
      return (
        matchesSearch &&
        (categoryFilter === "Favorites" ? matchesFavorites : matchesCategory)
      );
    });
  }, [presets, searchTerm, categoryFilter, favorites]);

  const categories = useMemo(
    () => [
      "All",
      "Favorites",
      ...Array.from(new Set(presets.map((p) => p.category))),
    ],
    [presets]
  );

  // NOW safe to return early
  if (!isOpen) return null;

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(filteredPresets.map((p) => p.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const exportPattern = async (
    preset: Preset,
    index: number,
    total: number
  ): Promise<void> => {
    const sanitizedName = preset.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const svgString = renderSVG({
      canvas: preset.canvas,
      layers: preset.layers,
      selectedLayerId: null,
    } as any);

    switch (format) {
      case "svg":
        const svgBlob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });
        downloadFile(svgBlob, `${sanitizedName}.svg`);
        break;

      case "png":
        await new Promise<void>((resolve, reject) => {
          const canvas = document.createElement("canvas");
          canvas.width = dimensions.width;
          canvas.height = dimensions.height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Canvas context not available"));
            return;
          }

          const img = new Image();
          const dataUrl = `data:image/svg+xml;base64,${btoa(
            unescape(encodeURIComponent(svgString))
          )}`;

          img.onload = () => {
            ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
            canvas.toBlob((blob) => {
              if (blob) {
                downloadFile(blob, `${sanitizedName}.png`);
                resolve();
              } else {
                reject(new Error("Failed to create blob"));
              }
            }, "image/png");
          };

          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = dataUrl;
        });
        break;

      case "css":
        const dataUrl = `data:image/svg+xml;base64,${btoa(
          unescape(encodeURIComponent(svgString))
        )}`;
        const cssCode = `/* ${preset.name} */\n.${sanitizedName} {\n  background-image: url('${dataUrl}');\n  background-size: cover;\n  background-position: center;\n  background-repeat: no-repeat;\n}\n\n`;
        const cssBlob = new Blob([cssCode], { type: "text/css" });
        downloadFile(cssBlob, `${sanitizedName}.css`);
        break;

      case "json":
        const jsonData = {
          name: preset.name,
          category: preset.category,
          theme: preset.theme,
          svg: svgString,
          canvas: preset.canvas,
          exportedAt: new Date().toISOString(),
        };
        const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], {
          type: "application/json",
        });
        downloadFile(jsonBlob, `${sanitizedName}.json`);
        break;
    }

    setProgress(Math.round(((index + 1) / total) * 100));
    await delay(300);
  };

  const handleBatchExport = async () => {
    if (selectedIds.length === 0) return;

    setIsExporting(true);
    setProgress(0);

    const selectedPresets = presets.filter((p) => selectedIds.includes(p.id));

    try {
      for (let i = 0; i < selectedPresets.length; i++) {
        await exportPattern(selectedPresets[i], i, selectedPresets.length);
      }
    } catch (error) {
      console.error("Batch export error:", error);
      alert(
        "Some exports may have failed. Please check your downloads folder."
      );
    } finally {
      setIsExporting(false);
      setProgress(100);

      setTimeout(() => {
        onClose();
        setSelectedIds([]);
        setProgress(0);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-auto shadow-2xl my-4">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Batch Export
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Export multiple patterns at once ({selectedIds.length} selected)
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isExporting}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Settings */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Export Settings
            </h3>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Format
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["svg", "png", "css", "json"] as ExportFormat[]).map(
                  (fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      disabled={isExporting}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        format === fmt
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* PNG Dimensions */}
            {format === "png" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={dimensions.width}
                    onChange={(e) =>
                      setDimensions({
                        ...dimensions,
                        width: parseInt(e.target.value) || 1920,
                      })
                    }
                    disabled={isExporting}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={dimensions.height}
                    onChange={(e) =>
                      setDimensions({
                        ...dimensions,
                        height: parseInt(e.target.value) || 1080,
                      })
                    }
                    disabled={isExporting}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Search and Filter */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search patterns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isExporting}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  disabled={isExporting}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    categoryFilter === cat
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={selectAll}
                disabled={isExporting || filteredPresets.length === 0}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select All ({filteredPresets.length})
              </button>
              <button
                onClick={deselectAll}
                disabled={isExporting || selectedIds.length === 0}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Pattern Grid */}
          <div className="max-h-[400px] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredPresets.map((preset) => {
                const svgString = renderSVG({
                  canvas: preset.canvas,
                  layers: preset.layers,
                  selectedLayerId: null,
                } as any);
                const dataUrl = `data:image/svg+xml;base64,${btoa(
                  unescape(encodeURIComponent(svgString))
                )}`;
                const isSelected = selectedIds.includes(preset.id);

                return (
                  <button
                    key={preset.id}
                    onClick={() => toggleSelection(preset.id)}
                    disabled={isExporting}
                    className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                      isSelected
                        ? "ring-4 ring-indigo-500 scale-95"
                        : "hover:scale-105 hover:shadow-lg"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={preset.name}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url("${dataUrl}")` }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                        <CheckIcon className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress Bar */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                <span>Exporting patterns...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleBatchExport}
            disabled={selectedIds.length === 0 || isExporting}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Exporting... ({progress}%)
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export {selectedIds.length}{" "}
                {selectedIds.length === 1 ? "Pattern" : "Patterns"}
              </>
            )}
          </button>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Your browser may block multiple
                downloads. Please allow popups from this site or click "Allow"
                when prompted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchExport;
