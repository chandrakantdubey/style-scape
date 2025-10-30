import React, { useState, useEffect, useRef } from 'react';
import type { Preset } from '../state/types';
import PatternCard from './PatternCard';

interface LazyPatternCardProps {
    preset: Preset;
    onPreview: (preset: Preset) => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    onCustomize: () => void;
}

const LazyPatternCard: React.FC<LazyPatternCardProps> = ({ preset, onPreview, isFavorite, onToggleFavorite, onCustomize }) => {
    const [isVisible, setIsVisible] = useState(false);
    const placeholderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '0px 0px 200px 0px', // Pre-load images 200px before they enter the viewport
            }
        );

        if (placeholderRef.current) {
            observer.observe(placeholderRef.current);
        }

        return () => {
            if (placeholderRef.current) {
                observer.unobserve(placeholderRef.current);
            }
        };
    }, []);

    if (isVisible) {
        return <PatternCard preset={preset} onPreview={onPreview} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} onCustomize={onCustomize} />;
    }

    return (
        <div 
            ref={placeholderRef} 
            className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-800"
            aria-label={`Loading pattern: ${preset.name}`}
        />
    );
};

export default LazyPatternCard;