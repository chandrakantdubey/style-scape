import React, { useState, useMemo, useEffect, useCallback } from "react";
import { produce } from "immer";
import { HexColorPicker } from "react-colorful";
import type {
  Preset,
  Layer,
  GradientLayer,
  BlobLayer,
  PatternLayer,
} from "../state/types";
import { renderSVG } from "../render/svgRenderer";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { CheckIcon, CloseIcon } from "./Icons";

interface CustomizeModalProps {
  preset: Preset;
  onClose: () => void;
}

// --- Internal UI Components ---

const ControlSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="mb-6">
    <h4 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
      {title}
    </h4>
    <div className="space-y-4">{children}</div>
  </div>
);

const ColorControl: React.FC<{
  label: string;
  color: string;
  onChange: (color: string) => void;
}> = ({ label, color, onChange }) => (
  <div>
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </span>
    <HexColorPicker
      className="!w-full my-2"
      color={color}
      onChange={onChange}
    />
  </div>
);

const SliderControl: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, step, onChange }) => {
  const numericValue = typeof value === "number" ? value : 0;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}: {numericValue.toFixed(step < 1 ? 2 : 0)}
      </label>
      <input
        type="range"
        value={numericValue}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
      />
    </div>
  );
};

// --- Main Modal Component ---

const CustomizeModal: React.FC<CustomizeModalProps> = ({ preset, onClose }) => {
  const [editedPreset, setEditedPreset] = useState<Preset>(preset);
  const [tailwindCopied, copyTailwind] = useCopyToClipboard();
  const [cssCopied, copyCSS] = useCopyToClipboard();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const svgString = useMemo(
    () =>
      renderSVG({
        canvas: editedPreset.canvas,
        layers: editedPreset.layers,
        selectedLayerId: null,
      }),
    [editedPreset]
  );

  const dataUrl = useMemo(
    () => `data:image/svg+xml,${encodeURIComponent(svgString)}`,
    [svgString]
  );

  const handleUpdateLayer = useCallback(
    <T extends Layer>(layerId: string, newProps: Partial<T>) => {
      setEditedPreset(
        produce((draft) => {
          const layer = draft.layers.find((l) => l.id === layerId);
          if (layer) {
            Object.assign(layer, newProps);
          }
        })
      );
    },
    []
  );

  const renderControls = () => {
    switch (preset.category) {
      case "Gradients": {
        const layer = editedPreset.layers.find((l) => l.type === "gradient") as
          | GradientLayer
          | undefined;
        if (!layer) return null;
        return (
          <ControlSection title="Gradient Controls">
            <ColorControl
              label="Color 1"
              color={layer.stops[0].color}
              onChange={(color) =>
                handleUpdateLayer(layer.id, {
                  stops: produce(layer.stops, (d) => {
                    d[0].color = color;
                  }),
                })
              }
            />
            <ColorControl
              label="Color 2"
              color={layer.stops[1].color}
              onChange={(color) =>
                handleUpdateLayer(layer.id, {
                  stops: produce(layer.stops, (d) => {
                    d[1].color = color;
                  }),
                })
              }
            />
            <SliderControl
              label="Angle"
              value={layer.angle}
              min={0}
              max={360}
              step={1}
              onChange={(value) =>
                handleUpdateLayer(layer.id, { angle: value })
              }
            />
          </ControlSection>
        );
      }
      case "Decorative":
      case "Abstract": {
        const layer = editedPreset.layers.find((l) => l.type === "blob") as
          | BlobLayer
          | undefined;
        if (!layer) return null;
        return (
          <ControlSection title="Blob Controls">
            <ColorControl
              label="Primary Color"
              color={layer.color}
              onChange={(color) => handleUpdateLayer(layer.id, { color })}
            />
            <SliderControl
              label="Complexity"
              value={layer.chaos}
              min={0}
              max={1.5}
              step={0.01}
              onChange={(value) =>
                handleUpdateLayer(layer.id, { chaos: value })
              }
            />
            <SliderControl
              label="Scale"
              value={layer.scale}
              min={0.1}
              max={2}
              step={0.01}
              onChange={(value) =>
                handleUpdateLayer(layer.id, { scale: value })
              }
            />
          </ControlSection>
        );
      }
      case "Geometric":
      case "Minimalist": {
        const layer = editedPreset.layers.find((l) => l.type === "pattern") as
          | PatternLayer
          | undefined;
        if (!layer) return null;
        return (
          <ControlSection title="Pattern Controls">
            <ColorControl
              label="Foreground"
              color={layer.foregroundColor}
              onChange={(color) =>
                handleUpdateLayer(layer.id, { foregroundColor: color })
              }
            />
            <ColorControl
              label="Background"
              color={layer.backgroundColor}
              onChange={(color) =>
                handleUpdateLayer(layer.id, { backgroundColor: color })
              }
            />
            <SliderControl
              label="Scale"
              value={layer.scale}
              min={5}
              max={100}
              step={1}
              onChange={(value) =>
                handleUpdateLayer(layer.id, { scale: value })
              }
            />
          </ControlSection>
        );
      }
      default:
        return (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This pattern type has no specific controls.
          </p>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Customize Pattern
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-grow p-6 grid md:grid-cols-2 gap-8 overflow-y-auto">
          {/* Preview Section */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Live Preview
            </h3>
            <div className="aspect-square rounded-lg overflow-hidden shadow-inner bg-gray-100 dark:bg-gray-900/50">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url("${dataUrl}")`,
                  backgroundSize: "cover",
                }}
              />
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Controls
            </h3>
            {renderControls()}
            <div className="mt-auto pt-6 space-y-2">
              <button
                onClick={() =>
                  copyTailwind(`bg-[url('${dataUrl}')] bg-cover bg-center`)
                }
                className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  tailwindCopied
                    ? "bg-green-600"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } text-white`}
              >
                {tailwindCopied && <CheckIcon />}
                <span>
                  {tailwindCopied ? "Copied!" : "Copy Tailwind Class"}
                </span>
              </button>
              <button
                onClick={() =>
                  copyCSS(
                    `background-image: url("${dataUrl}");\nbackground-size: cover;\nbackground-position: center;`
                  )
                }
                className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  cssCopied ? "bg-green-600" : "bg-gray-600 hover:bg-gray-700"
                } text-white`}
              >
                {cssCopied && <CheckIcon />}
                <span>{cssCopied ? "Copied!" : "Copy Plain CSS"}</span>
              </button>
              <button
                onClick={() => setEditedPreset(preset)}
                className="w-full text-sm text-center text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 pt-2"
              >
                Reset Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeModal;
