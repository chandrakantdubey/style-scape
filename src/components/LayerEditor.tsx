import React from 'react';
import useStore from '../state/store';
import type { Layer } from '../state/types';
import GradientEditor from './editors/GradientEditor';
import BlobEditor from './editors/BlobEditor';
import WaveEditor from './editors/WaveEditor';
import PatternEditor from './editors/PatternEditor';
import type { GradientLayer, BlobLayer, WaveLayer, PatternLayer } from '../state/types';

const Input = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className="block">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        <input {...props} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" />
    </label>
);

const Select = ({ label, children, ...props }: { label: string, children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <label className="block">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        <select {...props} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50">
            {children}
        </select>
    </label>
);


const LayerEditor: React.FC = () => {
    const { layer, updateLayer } = useStore(state => {
        const selectedLayer = state.present.layers.find(l => l.id === state.present.selectedLayerId);
        return {
            layer: selectedLayer,
            updateLayer: state.updateLayer,
        };
    });

    if (!layer) {
        return (
            <div className="w-80 p-4 border-l border-gray-700 text-center text-gray-500">
                Select a layer to edit its properties.
            </div>
        );
    }

    const renderEditor = () => {
        switch (layer.type) {
            case 'gradient':
                return <GradientEditor layer={layer as GradientLayer} />;
            case 'blob':
                return <BlobEditor layer={layer as BlobLayer} />;
            case 'wave':
                return <WaveEditor layer={layer as WaveLayer} />;
            case 'pattern':
                return <PatternEditor layer={layer as PatternLayer} />;
            default:
                return <p>This layer type does not have an editor yet.</p>;
        }
    };
    
    const commonUpdate = (newProps: Partial<Layer>) => {
        updateLayer(layer.id, newProps);
    };

    return (
        <div className="w-80 bg-gray-900 p-4 border-l border-gray-700 overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Edit Layer</h2>
            <div className="space-y-4">
                <Input 
                    label="Layer Name" 
                    type="text" 
                    value={layer.name} 
                    onChange={(e) => commonUpdate({ name: e.target.value })}
                />
                
                {renderEditor()}

                <hr className="border-gray-700" />
                <h3 className="text-md font-semibold text-gray-300">Composition</h3>

                <div>
                    <label htmlFor="opacity" className="block text-sm font-medium text-gray-400">Opacity</label>
                    <input
                        type="range" min="0" max="1" step="0.01"
                        value={layer.opacity}
                        onChange={(e) => commonUpdate({ opacity: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                
                <Select
                    label="Blend Mode"
                    value={layer.blendMode}
                    onChange={(e) => commonUpdate({ blendMode: e.target.value })}
                >
                    {['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'].map(mode => (
                        <option key={mode} value={mode}>{mode}</option>
                    ))}
                </Select>
            </div>
        </div>
    );
};

export default LayerEditor;