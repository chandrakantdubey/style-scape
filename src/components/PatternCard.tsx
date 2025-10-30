import React, { useMemo, useState } from 'react';
import type { Preset } from '../state/types';
import { renderSVG } from '../render/svgRenderer';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { StarIcon, CopyIcon, CheckIcon } from './Icons';

interface PatternCardProps {
    preset: Preset;
    onPreview: (preset: Preset) => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    onCustomize: () => void;
}

const PatternCard: React.FC<PatternCardProps> = ({ preset, onPreview, isFavorite, onToggleFavorite, onCustomize }) => {
    const [isCopied, copy] = useCopyToClipboard();
    const [isOverlayVisible, setOverlayVisible] = useState(false);
    
    const svgString = useMemo(() => renderSVG({
        canvas: preset.canvas,
        layers: preset.layers,
        selectedLayerId: null,
    }), [preset]);
    
    const dataUrl = useMemo(() => `data:image/svg+xml,${encodeURIComponent(svgString)}`, [svgString]);
    const backgroundImageUrl = useMemo(() => `url("${dataUrl}")`, [dataUrl]);

    const handleCopyClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const tailwindClass = `bg-[url('${dataUrl}')] bg-cover bg-center`;
        copy(tailwindClass);
    };

    const handlePreviewClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPreview(preset);
    };
    
    const handleCustomizeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCustomize();
    };

    return (
        <div 
            className="aspect-square rounded-xl shadow-lg overflow-hidden relative group"
            onClick={() => setOverlayVisible(!isOverlayVisible)}
        >
            <div className="absolute inset-0 pattern-card" style={{ backgroundImage: backgroundImageUrl }}></div>

            <button 
                onClick={handleCopyClick}
                className="absolute top-3 left-3 bg-black/30 backdrop-blur-sm p-2 rounded-full text-white/80 hover:text-white hover:bg-black/50 transition-all duration-200 z-20"
                aria-label="Copy Tailwind Class"
            >
                {isCopied ? <CheckIcon className="h-5 w-5" /> : <CopyIcon className="h-5 w-5" />}
            </button>

            <button 
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} 
                className={`absolute top-3 right-3 transition-all duration-200 transform hover:scale-110 p-1.5 bg-black/20 rounded-full backdrop-blur-sm z-20 ${isFavorite ? 'text-yellow-400' : 'text-white/50 hover:text-white'}`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
                <StarIcon filled={isFavorite} />
            </button>

            <div className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 text-center z-10 ${isOverlayVisible ? 'opacity-100' : ''}`}>
                <h3 className="text-white font-bold text-lg drop-shadow-md">{preset.name}</h3>
                <div className="mt-4 flex flex-col space-y-2 w-full max-w-[200px]">
                    <button onClick={handlePreviewClick} className="bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors w-full">Preview</button>
                    <button onClick={handleCustomizeClick} className="bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors w-full">Customize</button>
                </div>
            </div>
        </div>
    );
};

export default PatternCard;