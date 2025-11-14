import React from 'react';
import type { Preset } from '../state/types';
import LazyPatternCard from './LazyPatternCard';

interface SelectablePatternCardProps {
    preset: Preset;
    onPreview: (preset: Preset) => void;
    isSelected: boolean;
    selectionIndex?: number;
    onToggleSelection: () => void;
    disabled?: boolean;
}

const SelectablePatternCard: React.FC<SelectablePatternCardProps> = ({
    preset,
    onPreview,
    isSelected,
    selectionIndex,
    onToggleSelection,
    disabled = false,
}) => {
    return (
        <div
            className={`relative aspect-square rounded-xl overflow-hidden transition-all cursor-pointer ${
                isSelected
                    ? 'ring-4 ring-indigo-500 scale-95'
                    : disabled
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:scale-105 hover:shadow-lg'
            }`}
            onClick={disabled ? undefined : onToggleSelection}
            title={preset.name}
        >
            <LazyPatternCard
                preset={preset}
                onPreview={onPreview}
            />

            {isSelected && selectionIndex !== undefined && (
                <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-30">
                    {selectionIndex + 1}
                </div>
            )}
        </div>
    );
};

export default SelectablePatternCard;
