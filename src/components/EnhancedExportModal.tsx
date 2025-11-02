// ============================================
// FILE 1: components/EnhancedExportModal.tsx
// ============================================
import React, { useState, useMemo } from "react";
import { CloseIcon, CheckIcon, CopyIcon } from "./Icons";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";

interface EnhancedExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  svgString: string;
  presetName: string;
  canvasWidth: number;
  canvasHeight: number;
}

type ExportFormat =
  | "css"
  | "tailwind"
  | "svg"
  | "png"
  | "react"
  | "vue"
  | "svelte"
  | "json";

const EnhancedExportModal: React.FC<EnhancedExportModalProps> = ({
  isOpen,
  onClose,
  svgString,
  presetName,
  canvasWidth,
  canvasHeight,
}) => {
  const [format, setFormat] = useState<ExportFormat>("css");
  const [isCopied, copy] = useCopyToClipboard();
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [cssVariant, setCssVariant] = useState<"url" | "base64">("base64");
  const [includeComments, setIncludeComments] = useState(true);

  if (!isOpen) return null;

  const dataUrl = useMemo(
    () =>
      `data:image/svg+xml;base64,${btoa(
        unescape(encodeURIComponent(svgString))
      )}`,
    [svgString]
  );

  const getCode = () => {
    const comments = includeComments;

    switch (format) {
      case "css":
        if (cssVariant === "base64") {
          return `${
            comments ? "/* StyleScape Generated Background */\n" : ""
          }.background-pattern {
  background-image: url('${dataUrl}');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
}

${
  comments ? "/* Optional: For fixed background */\n" : ""
}.background-pattern-fixed {
  background-attachment: fixed;
}`;
        } else {
          return `${
            comments
              ? "/* StyleScape Generated Background - External SVG */\n"
              : ""
          }.background-pattern {
  background-image: url('path/to/${presetName}.svg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
}`;
        }

      case "tailwind":
        return `${
          comments ? "<!-- StyleScape Generated Background -->\n" : ""
        }<div 
  class="min-h-screen bg-cover bg-center bg-no-repeat" 
  style="background-image: url('${dataUrl}')"
>
  <!-- Your content here -->
</div>

${
  comments ? "<!-- Alternative with arbitrary values (Tailwind 3.0+) -->\n" : ""
}<div class="min-h-screen bg-[url('${dataUrl}')] bg-cover bg-center bg-no-repeat">
  <!-- Your content here -->
</div>`;

      case "react":
        return `${
          comments ? "// StyleScape Generated Background Component\n" : ""
        }import React from 'react';

const BackgroundPattern = ({ children }) => {
  const bgStyle = {
    backgroundImage: \`url('${dataUrl}')\`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh'
  };
  
  return (
    <div style={bgStyle} className="background-pattern">
      {children}
    </div>
  );
};

export default BackgroundPattern;

${
  comments
    ? "// Usage:\n// <BackgroundPattern>\n//   <YourContent />\n// </BackgroundPattern>"
    : ""
}`;

      case "vue":
        return `${
          comments ? "<!-- StyleScape Generated Background Component -->\n" : ""
        }<template>
  <div class="background-pattern" :style="bgStyle">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue';

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

${
  comments
    ? "<!-- Usage:\n<BackgroundPattern>\n  <YourContent />\n</BackgroundPattern>\n-->"
    : ""
}`;

      case "svelte":
        return `${
          comments ? "<!-- StyleScape Generated Background Component -->\n" : ""
        }<script>
  const bgStyle = \`
    background-image: url('${dataUrl}');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    min-height: 100vh;
  \`;
</script>

<div class="background-pattern" style={bgStyle}>
  <slot />
</div>

<style>
  .background-pattern {
    position: relative;
  }
</style>

${
  comments
    ? "<!-- Usage:\n<BackgroundPattern>\n  <YourContent />\n</BackgroundPattern>\n-->"
    : ""
}`;

      case "svg":
        return svgString;

      case "json":
        return JSON.stringify(
          {
            name: presetName,
            format: "svg",
            dataUrl: dataUrl,
            dimensions: {
              width: canvasWidth,
              height: canvasHeight,
            },
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        );

      default:
        return "";
    }
  };

  const handleCopy = () => {
    copy(getCode());
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

  const handleExport = () => {
    const sanitizedName = presetName.replace(/[^a-z0-9]/gi, "-").toLowerCase();

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
          img.onerror = () => {
            alert(
              "Failed to convert SVG to PNG. Please try downloading as SVG instead."
            );
          };
          img.src = dataUrl;
        }
        break;

      case "json":
        const jsonBlob = new Blob([getCode()], { type: "application/json" });
        downloadFile(jsonBlob, `${sanitizedName}.json`);
        break;

      default:
        const ext =
          format === "react"
            ? "jsx"
            : format === "vue"
            ? "vue"
            : format === "svelte"
            ? "svelte"
            : format === "tailwind"
            ? "html"
            : "css";
        const codeBlob = new Blob([getCode()], { type: "text/plain" });
        downloadFile(codeBlob, `${sanitizedName}.${ext}`);
        break;
    }
  };

  const formatOptions: { value: ExportFormat; label: string; icon: string }[] =
    [
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-auto shadow-2xl my-4">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Export Pattern
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {presetName}
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
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-900 dark:text-white">
              Export Format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formatOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormat(opt.value)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    format === opt.value
                      ? "bg-indigo-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CSS Variant Selection */}
          {format === "css" && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                CSS Variant
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCssVariant("base64")}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    cssVariant === "base64"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Inline (Base64)
                </button>
                <button
                  onClick={() => setCssVariant("url")}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    cssVariant === "url"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  External URL
                </button>
              </div>
            </div>
          )}

          {/* PNG Dimensions */}
          {format === "png" && (
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-900 dark:text-white">
                Export Dimensions
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
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
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
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
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                {[
                  { w: 1920, h: 1080, label: "Full HD" },
                  { w: 2560, h: 1440, label: "2K" },
                  { w: 3840, h: 2160, label: "4K" },
                  { w: 1080, h: 1920, label: "Mobile" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() =>
                      setDimensions({ width: preset.w, height: preset.h })
                    }
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          {format !== "png" && format !== "svg" && (
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeComments}
                  onChange={(e) => setIncludeComments(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                />
                Include helpful comments
              </label>
            </div>
          )}

          {/* Code Preview */}
          {format !== "png" && (
            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  Code Preview
                </label>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    isCopied
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {isCopied ? (
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
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-xs text-gray-800 dark:text-gray-200 max-h-80 border border-gray-200 dark:border-gray-700 font-mono">
                {getCode()}
              </pre>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
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
            Download {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedExportModal;
