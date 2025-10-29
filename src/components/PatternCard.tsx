import React, { useMemo } from "react";
import type { Preset } from "../state/types";
import { renderSVG } from "../render/svgRenderer";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { StarIcon, NewTagIcon, CheckIcon } from "./Icons";

interface PatternCardProps {
  preset: Preset;
  onPreview: (preset: Preset) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const PatternCard: React.FC<PatternCardProps> = ({
  preset,
  onPreview,
  isFavorite,
  onToggleFavorite,
}) => {
  const [isCopied, copy] = useCopyToClipboard();

  const svgString = useMemo(
    () =>
      renderSVG({
        canvas: preset.canvas,
        layers: preset.layers,
        selectedLayerId: null,
      }),
    [preset]
  );

  const svgDataUrl = useMemo(
    () => `url("data:image/svg+xml,${encodeURIComponent(svgString)}")`,
    [svgString]
  );

  const handleCopy = () => {
    const css = `background-image: ${svgDataUrl}; background-size: cover; background-position: center;`;
    copy(css);
  };

  return (
    <div className="aspect-square rounded-xl shadow-lg overflow-hidden relative group">
      <div
        className="absolute inset-0 pattern-card"
        style={{ backgroundImage: svgDataUrl }}
      ></div>

      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 text-center">
        <h3 className="text-white font-bold text-lg drop-shadow-md">
          {preset.name}
        </h3>
        <div className="mt-4 flex flex-col space-y-2 w-full max-w-[200px]">
          <button
            onClick={() => onPreview(preset)}
            className="bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors w-full"
          >
            Preview
          </button>
          <button
            onClick={handleCopy}
            className={`font-semibold py-2 px-4 rounded-lg transition-colors w-full relative flex items-center justify-center space-x-2 ${
              isCopied ? "bg-green-500" : "bg-indigo-600 hover:bg-indigo-700"
            } text-white`}
          >
            {isCopied && <CheckIcon />}
            <span>{isCopied ? "Copied!" : "Copy CSS"}</span>
          </button>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className={`absolute top-3 left-3 transition-all duration-200 transform hover:scale-110 ${
          isFavorite ? "text-yellow-400" : "text-white/50 hover:text-white"
        }`}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <StarIcon filled={isFavorite} />
      </button>

      {preset.isNew && (
        <div className="absolute top-3 right-3">
          <NewTagIcon />
        </div>
      )}
    </div>
  );
};

export default PatternCard;
