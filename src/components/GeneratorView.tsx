import React, { useState, useCallback, useMemo } from 'react';
import { HexColorPicker } from 'react-colorful';
import type { Preset, PresetCategory, PresetTheme } from '../state/types';
import { 
    generateGradientPreset, 
    generateBlobPreset, 
    generatePatternPreset, 
    generateWavePreset, 
    generateAbstractPreset,
    generateMetallicPreset,
    generateGridPreset,
    generateMinimalistPreset,
    generateGlassPreset,
} from '../presets/generators';
import {
    generateNoisePreset,
    generateParticlePreset,
    generateMeshPreset,
    generateStripedPreset,
} from '../presets/enhancedGenerators';
import LazyPatternCard from './LazyPatternCard';
import { ArrowDownIcon } from './Icons';

interface GeneratorViewProps {
    onPreview: (preset: Preset) => void;
    isBgDark: boolean;
    onBack: () => void;
}

const generatorMap: Record<Exclude<PresetCategory, "Mixed">, (id:string, name: string, theme: PresetTheme, isNew: boolean, seed: string, customPalette?: string[][]) => Preset> = {
    'Gradients': generateGradientPreset,
    'Decorative': generateBlobPreset,
    'Geometric': generatePatternPreset,
    'Minimalist': generateMinimalistPreset,
    'Waves': generateWavePreset,
    'Abstract': generateAbstractPreset,
    'Metallic': generateMetallicPreset,
    'Grid': generateGridPreset,
    'Glassmorphism': generateGlassPreset,
    'Texture': generateNoisePreset,
    'Particles': generateParticlePreset,
    'Mesh': generateMeshPreset,
    'Stripe': generateStripedPreset,
};
const CATEGORIES = Object.keys(generatorMap) as PresetCategory[];
const FILTER_CATEGORIES: ('All' | PresetCategory)[] = ['All', ...CATEGORIES];
const THEME_FILTERS: ('All' | 'Light' | 'Dark')[] = ['All', 'Light', 'Dark'];

const GeneratorView: React.FC<GeneratorViewProps> = ({ onPreview, isBgDark, onBack }) => {
    const [colors, setColors] = useState([
        { id: `c-${Date.now()}-1`, value: '#6366f1' },
        { id: `c-${Date.now()}-2`, value: '#ec4899' },
    ]);
    const [generatedPatterns, setGeneratedPatterns] = useState<Preset[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // State for filtering results
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [activeThemeFilter, setActiveThemeFilter] = useState<string>('All');

    const updateColor = (id: string, newColor: string) => {
        setColors(prev => prev.map(c => c.id === id ? { ...c, value: newColor } : c));
    };

    const addColor = () => {
        if (colors.length < 5) {
            setColors(prev => [...prev, { id: `c-${Date.now()}`, value: '#ffffff' }]);
        }
    };
    
    const removeColor = (id: string) => {
        if (colors.length > 2) {
            setColors(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleGenerate = useCallback(() => {
        setIsGenerating(true);
        setGeneratedPatterns([]);

        setTimeout(() => {
            const userColors = colors.map(c => c.value);
            const customPalette: string[][] = [];
            if (userColors.length > 1) {
                for(let i = 0; i < userColors.length; i++) {
                    customPalette.push([userColors[i], userColors[(i + 1) % userColors.length]]);
                }
            } else if (userColors.length === 1) {
                customPalette.push([userColors[0], userColors[0]]);
            }

            const newPatterns: Preset[] = [];
            const themesToGenerate: PresetTheme[] = ['dark', 'light'];

            CATEGORIES.forEach(category => {
                themesToGenerate.forEach(theme => {
                    const generator = generatorMap[category as keyof typeof generatorMap];
                    for(let i = 0; i < 30; i++) {
                        const seed = `${category}-${theme}-${i}-${Date.now()}-${Math.random()}`;
                        const id = seed;
                        const name = `${category} ${theme} #${i+1}`;
                        const preset = generator(id, name, theme, false, seed, customPalette);
                        newPatterns.push(preset);
                    }
                });
            });

            for (let i = newPatterns.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newPatterns[i], newPatterns[j]] = [newPatterns[j], newPatterns[i]];
            }

            setGeneratedPatterns(newPatterns);
            setIsGenerating(false);
            if(newPatterns.length > 0) {
              onPreview(newPatterns[0]);
            }
        }, 100);

    }, [colors, onPreview]);
    
    const filteredPatterns = useMemo(() => {
        return generatedPatterns.filter(p => {
            if (activeCategory !== 'All' && p.category !== activeCategory) {
                return false;
            }
            const themeFilterLower = activeThemeFilter.toLowerCase();
            if (activeThemeFilter !== 'All' && p.theme !== themeFilterLower) {
                return false;
            }
            return true;
        });
    }, [generatedPatterns, activeCategory, activeThemeFilter]);

    const titleColor = isBgDark ? 'text-gray-100' : 'text-gray-900';
    const subtitleColor = isBgDark ? 'text-gray-300' : 'text-gray-600';
    const panelBg = isBgDark ? 'bg-gray-900/70 border-gray-700' : 'bg-white/70 border-gray-200';
    const textColor = isBgDark ? 'text-gray-200' : 'text-gray-800';
    const emptyStateBg = isBgDark ? 'bg-gray-800/50' : 'bg-white/50';
    const categoryBtnBase = isBgDark ? 'bg-gray-800/70 text-gray-200 hover:bg-gray-700' : 'bg-white/70 text-gray-700 hover:bg-gray-100';
    const themeBtnBase = isBgDark ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700' : 'bg-white/50 text-gray-600 hover:bg-gray-200';
    const countPillBase = isBgDark ? 'text-gray-300 bg-gray-800/50' : 'text-gray-700 bg-white/50';

    return (
        <>
            <header className="h-screen w-full flex flex-col items-center justify-center text-center relative p-4">
                 <button 
                    onClick={onBack} 
                    className={`absolute top-6 left-6 backdrop-blur-sm rounded-full py-2 px-4 text-sm font-semibold transition-colors ${isBgDark ? 'bg-gray-800/50 text-gray-200 hover:bg-gray-700' : 'bg-white/50 text-gray-700 hover:bg-gray-200'}`}
                >
                    &larr; Back to Library
                </button>
                <h2 className={`text-5xl md:text-6xl font-extrabold drop-shadow-lg ${titleColor}`}>Generate Your Own</h2>
                <p className={`mt-4 max-w-2xl text-lg drop-shadow-md ${subtitleColor}`}>Craft a unique palette and generate a custom set of backgrounds. Scroll down to begin.</p>
                <a href="#generator-controls" className={`absolute bottom-10 animate-bounce p-2 rounded-full ${isBgDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}>
                    <ArrowDownIcon className={`w-8 h-8 ${subtitleColor}`} />
                </a>
            </header>
            <main id="generator-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 min-h-screen">
                <div id="generator-controls" className={`scroll-mt-4 backdrop-blur-lg rounded-xl border ${panelBg} p-4 sm:p-6`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="md:col-span-2">
                            <h3 className={`text-lg font-semibold mb-3 ${textColor}`}>Your Palette</h3>
                            <div className="flex flex-wrap items-center gap-4">
                                {colors.map(color => (
                                    <div key={color.id} className="relative group">
                                        <HexColorPicker color={color.value} onChange={(newColor) => updateColor(color.id, newColor)} style={{width: 100, height: 100}}/>
                                        <button onClick={() => removeColor(color.id)} disabled={colors.length <= 2} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity">
                                           &times;
                                        </button>
                                    </div>
                                ))}
                                {colors.length < 5 && (
                                    <button onClick={addColor} className={`w-24 h-24 rounded-md flex items-center justify-center border-2 border-dashed transition-colors ${isBgDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-200'}`}>
                                        <span className={`text-3xl font-light ${isBgDark ? 'text-gray-500' : 'text-gray-400'}`}>+</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-col space-y-4">
                             <button 
                                onClick={handleGenerate} 
                                disabled={isGenerating}
                                className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-green-700 disabled:bg-green-800 disabled:cursor-wait transition-colors"
                            >
                                {isGenerating ? 'Generating...' : `Generate ${CATEGORIES.length * 2 * 30} Patterns`}
                            </button>
                        </div>
                    </div>
                </div>

                {isGenerating && (
                    <div className="mt-12 text-center">
                        <p className={`text-lg font-semibold animate-pulse ${textColor}`}>Creating magic...</p>
                    </div>
                )}
                
                {generatedPatterns.length > 0 && !isGenerating && (
                    <div className="mt-12">
                        <div className="space-y-4">
                            <div className="flex justify-center flex-wrap gap-2">
                                {FILTER_CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors backdrop-blur-sm ${activeCategory === cat ? 'bg-indigo-600 text-white' : categoryBtnBase}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-center flex-wrap gap-2">
                                {THEME_FILTERS.map(theme => (
                                    <button
                                        key={theme}
                                        onClick={() => setActiveThemeFilter(theme)}
                                        className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors backdrop-blur-sm ${activeThemeFilter === theme ? 'bg-gray-700 text-white' : themeBtnBase}`}
                                    >
                                        {theme}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <p className={`mt-8 text-center text-sm font-medium inline-block backdrop-blur-sm rounded-full px-4 py-1 ${countPillBase}`}>
                           Showing {filteredPatterns.length} of {generatedPatterns.length} generated patterns
                        </p>
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredPatterns.map(preset => (
                                 <LazyPatternCard 
                                    key={preset.id} 
                                    preset={preset} 
                                    onPreview={onPreview} 
                                />
                            ))}
                        </div>
                    </div>
                )}

                {generatedPatterns.length === 0 && !isGenerating && (
                     <div className={`mt-12 text-center backdrop-blur-sm rounded-lg p-8 ${emptyStateBg}`}>
                        <h3 className={`text-xl font-semibold ${textColor}`}>Your creations will appear here</h3>
                        <p className="mt-2 text-gray-400">Adjust your palette and click generate!</p>
                    </div>
                )}
            </main>
        </>
    );
};

export default GeneratorView;