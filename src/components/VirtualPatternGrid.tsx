import React from "react";
import { FixedSizeGrid as Grid } from "react-window";
import type { Preset } from "../state/types";
import LazyPatternCard from "./LazyPatternCard";

interface VirtualPatternGridProps {
  presets: Preset[];
  onPreview: (preset: Preset) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

const VirtualPatternGrid: React.FC = ({
  presets,
  onPreview,
  favorites,
  onToggleFavorite,
}) => {
  const columnCount = 4;
  const rowCount = Math.ceil(presets.length / columnCount);
  const columnWidth = 280;
  const rowHeight = 280;

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    const preset = presets[index];

    if (!preset) return null;

    return (
      <LazyPatternCard
        preset={preset}
        onPreview={onPreview}
        isFavorite={favorites.includes(preset.id)}
        onToggleFavorite={() => onToggleFavorite(preset.id)}
      />
    );
  };

  return { Cell };
};

export default VirtualPatternGrid;
