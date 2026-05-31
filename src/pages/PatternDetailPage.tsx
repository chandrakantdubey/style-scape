// pages/PatternDetailPage.tsx - With all export/copy options
import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import type { Preset } from "../state/types";
import { renderSVG } from "../render/svgRenderer";
import { CheckIcon, CopyIcon, StarIcon } from "../components/Icons";
import { saveSessionState, useSessionState } from "../hooks/useSessionState";

interface PatternDetailPageProps {
  presets: Preset[];
  onPreview: (preset: Preset) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  isBgDark: boolean;
}

type ExportFormat =
  | "css"
  | "tailwind"
  | "react"
  | "vue"
  | "svelte"
  | "svg"
  | "png"
  | "json";

const PatternDetailPage: React.FC<PatternDetailPageProps> = ({
  presets,
  onPreview,
  favorites,
  onToggleFavorite,
  isBgDark,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTabState] = useSessionState<ExportFormat>(
    "stylescape:detail-export-tab",
    "css"
  );
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  const preset = presets.find((p) => p.id === id);

  const setActiveTab = (tab: ExportFormat) => {
    setActiveTabState(tab);
    saveSessionState("stylescape:detail-export-tab", tab);
  };

  const svgString = useMemo(() => {
    if (!preset) return "";
    return renderSVG({
      canvas: preset.canvas,
      layers: preset.layers,
      selectedLayerId: null,
    } as any);
  }, [preset]);

  const dataUrl = useMemo(
    () =>
      `data:image/svg+xml;base64,${btoa(
        unescape(encodeURIComponent(svgString))
      )}`,
    [svgString]
  );

  if (!preset) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2
            className={`text-2xl font-bold ${
              isBgDark ? "text-white" : "text-gray-900"
            }`}
          >
            Pattern not found
          </h2>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const getCode = (format: ExportFormat): string => {
    switch (format) {
      case "css":
        return `.background-pattern {
  background-image: url('${dataUrl}');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
}

/* Fixed background variant */
.background-pattern-fixed {
  background-attachment: fixed;
}`;

      case "tailwind":
        return `<!-- Inline style approach -->
<div 
  class="min-h-screen bg-cover bg-center bg-no-repeat" 
  style="background-image: url('${dataUrl}')"
>
  <!-- Your content here -->
</div>

<!-- Tailwind utility approach -->
<div 
  class="min-h-screen bg-cover bg-center bg-no-repeat" 
  style="background-image: url('${dataUrl}')"
>
  <!-- Your content here -->
</div>`;

      case "react":
        return `// BackgroundPattern.tsx
import React from 'react';

interface BackgroundPatternProps {
  children?: React.ReactNode;
  className?: string;
}

const BackgroundPattern: React.FC<BackgroundPatternProps> = ({ 
  children, 
  className = '' 
}) => {
  const bgStyle = {
    backgroundImage: \`url('${dataUrl}')\`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh'
  };
  
  return (
    <div style={bgStyle} className={\`background-pattern \${className}\`}>
      {children}
    </div>
  );
};

export default BackgroundPattern;

// Usage:
// <BackgroundPattern>
//   <YourContent />
// </BackgroundPattern>`;

      case "vue":
        return `<!-- BackgroundPattern.vue -->
<template>
  <div class="background-pattern" :style="bgStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  className: ''
});

const bgStyle = computed(() => ({
  backgroundImage: \`url('${dataUrl}')\`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  minHeight: '100vh'
}));
</script>

<style scoped>
.background-pattern {
  position: relative;
}
</style>

<!-- Usage:
<BackgroundPattern>
  <YourContent />
</BackgroundPattern>
-->`;

      case "svelte":
        return `<!-- BackgroundPattern.svelte -->
<script lang="ts">
  export let className: string = '';
  
  const bgStyle = \`
    background-image: url('${dataUrl}');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    min-height: 100vh;
  \`;
</script>

<div class="background-pattern {className}" style={bgStyle}>
  <slot />
</div>

<style>
  .background-pattern {
    position: relative;
  }
</style>

<!-- Usage:
<BackgroundPattern>
  <YourContent />
</BackgroundPattern>
-->`;

      case "svg":
        return svgString;

      case "json":
        return JSON.stringify(
          {
            id: preset.id,
            name: preset.name,
            category: preset.category,
            theme: preset.theme,
            canvas: preset.canvas,
            layers: preset.layers,
            dataUrl: dataUrl,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        );

      default:
        return "";
    }
  };

  const handleCopy = (format: ExportFormat) => {
    navigator.clipboard.writeText(getCode(format));
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
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

  const handleDownload = (format: ExportFormat) => {
    const sanitizedName = preset.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();

    switch (format) {
      case "svg":
        const svgBlob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });
        downloadFile(svgBlob, `${sanitizedName}.svg`);
        break;

      case "png":
        const canvas = document.createElement("canvas");
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
            canvas.toBlob((blob) => {
              if (blob) downloadFile(blob, `${sanitizedName}.png`);
            }, "image/png");
          };
          img.src = dataUrl;
        }
        break;

      case "json":
        const jsonBlob = new Blob([getCode("json")], {
          type: "application/json",
        });
        downloadFile(jsonBlob, `${sanitizedName}.json`);
        break;

      default:
        const ext =
          format === "react"
            ? "tsx"
            : format === "vue"
            ? "vue"
            : format === "svelte"
            ? "svelte"
            : format === "tailwind"
            ? "html"
            : "css";
        const codeBlob = new Blob([getCode(format)], { type: "text/plain" });
        downloadFile(codeBlob, `${sanitizedName}.${ext}`);
        break;
    }
  };

  const textColor = isBgDark ? "text-white" : "text-gray-900";
  const bgPanel = isBgDark ? "bg-gray-900/80" : "bg-white/80";
  const borderColor = isBgDark ? "border-gray-700" : "border-gray-300";
  const isFavorite = favorites.includes(preset.id);

  const formatTabs: { value: ExportFormat; label: string; icon: string }[] = [
    { value: "css", label: "CSS", icon: "🎨" },
    { value: "tailwind", label: "Tailwind", icon: "🌊" },
    { value: "react", label: "React", icon: "⚛️" },
    { value: "vue", label: "Vue", icon: "💚" },
    { value: "svelte", label: "Svelte", icon: "🔥" },
    { value: "svg", label: "SVG", icon: "📐" },
    { value: "png", label: "PNG", icon: "🖼️" },
    { value: "json", label: "JSON", icon: "📋" },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header
        className={`sticky top-0 ${bgPanel} backdrop-blur-lg border-b ${borderColor} z-10`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
              <div>
                <h1 className={`text-2xl font-bold ${textColor}`}>
                  {preset.name}
                </h1>
                <p
                  className={`text-sm ${
                    isBgDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {preset.category} • {preset.theme}
                </p>
              </div>
            </div>
            <button
              onClick={() => onToggleFavorite(preset.id)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite
                  ? "text-yellow-400 bg-yellow-400/10"
                  : isBgDark
                  ? "text-gray-400 hover:text-yellow-400"
                  : "text-gray-600 hover:text-yellow-600"
              }`}
            >
              <StarIcon filled={isFavorite} className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview */}
          <div
            className={`${bgPanel} backdrop-blur-lg rounded-xl border ${borderColor} p-6`}
          >
            <h2 className={`text-xl font-bold mb-4 ${textColor}`}>Preview</h2>
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url("${dataUrl}")` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => onPreview(preset)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Set as Background
              </button>
              <button
                onClick={() => handleDownload(activeTab)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Download {activeTab.toUpperCase()}
              </button>
            </div>
          </div>

          {/* Export Code */}
          <div
            className={`${bgPanel} backdrop-blur-lg rounded-xl border ${borderColor} p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${textColor}`}>Export Code</h2>
              <button
                onClick={() => handleCopy(activeTab)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  copiedFormat === activeTab
                    ? "bg-green-600 text-white"
                    : isBgDark
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                {copiedFormat === activeTab ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Format Tabs */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {formatTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                    activeTab === tab.value
                      ? "bg-indigo-600 text-white shadow-lg scale-105"
                      : isBgDark
                      ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* PNG Dimensions */}
            {activeTab === "png" && (
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-medium mb-1 ${textColor}`}
                  >
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
                    className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${
                      isBgDark
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-medium mb-1 ${textColor}`}
                  >
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
                    className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${
                      isBgDark
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
              </div>
            )}

            {/* Code Display */}
            <div className="relative">
              <pre
                className={`p-4 rounded-lg overflow-auto text-xs max-h-[600px] border ${borderColor} ${
                  isBgDark
                    ? "bg-gray-800 text-gray-200"
                    : "bg-gray-50 text-gray-800"
                } font-mono`}
              >
                {getCode(activeTab)}
              </pre>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div
          className={`mt-8 ${bgPanel} backdrop-blur-lg rounded-xl border ${borderColor} p-6`}
        >
          <h2 className={`text-xl font-bold mb-4 ${textColor}`}>
            For Developers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-lg ${
                isBgDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <div className="text-2xl mb-2">⚡</div>
              <h3 className={`font-semibold mb-1 ${textColor}`}>
                React, Vue, Svelte
              </h3>
              <p
                className={`text-sm ${
                  isBgDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Framework-specific components with TypeScript support
              </p>
            </div>
            <div
              className={`p-4 rounded-lg ${
                isBgDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <div className="text-2xl mb-2">🎨</div>
              <h3 className={`font-semibold mb-1 ${textColor}`}>
                Tailwind CSS
              </h3>
              <p
                className={`text-sm ${
                  isBgDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Ready-to-use Tailwind classes and arbitrary values
              </p>
            </div>
            <div
              className={`p-4 rounded-lg ${
                isBgDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <div className="text-2xl mb-2">📐</div>
              <h3 className={`font-semibold mb-1 ${textColor}`}>SVG & PNG</h3>
              <p
                className={`text-sm ${
                  isBgDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Optimized SVG or custom dimensions PNG export
              </p>
            </div>
            <div
              className={`p-4 rounded-lg ${
                isBgDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <div className="text-2xl mb-2">📋</div>
              <h3 className={`font-semibold mb-1 ${textColor}`}>JSON Export</h3>
              <p
                className={`text-sm ${
                  isBgDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Full pattern configuration for API integration
              </p>
            </div>
            <div
              className={`p-4 rounded-lg ${
                isBgDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <div className="text-2xl mb-2">🔧</div>
              <h3 className={`font-semibold mb-1 ${textColor}`}>
                Best Practices
              </h3>
              <p
                className={`text-sm ${
                  isBgDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Production-ready code following framework conventions
              </p>
            </div>
            <div
              className={`p-4 rounded-lg ${
                isBgDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <div className="text-2xl mb-2">🖼️</div>
              <h3 className={`font-semibold mb-1 ${textColor}`}>
                Custom Dimensions
              </h3>
              <p
                className={`text-sm ${
                  isBgDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Export PNG at any resolution for any device
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatternDetailPage;
