import React from 'react';
import { HexColorPicker } from 'react-colorful';
import useStore from '../../state/store';
import type { PatternLayer } from '../../state/types';

interface PatternEditorProps {
    layer: PatternLayer;
}

const Slider = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
        <label className="block text-sm font-medium text-gray-400">{label}</label>
        <input
            type="range"
            {...props}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
    </div>
);

const PatternEditor: React.FC<PatternEditorProps> = ({ layer }) => {
    const updateLayer = useStore((state) => state.updateLayer);

    const handleUpdate = (newProps: Partial<PatternLayer>) => {
        updateLayer(layer.id, newProps);
    };

    const patternTypes: PatternLayer['patternType'][] = ['dots', 'lines', 'squares'];

    return (
        <div className="space-y-4">
             <div>
                <span className="text-sm font-medium text-gray-400">Pattern Type</span>
                <div className="flex mt-1 rounded-md shadow-sm">
                    {patternTypes.map(type => (
                         <button 
                            key={type}
                            onClick={() => handleUpdate({ patternType: type })} 
                            className={`px-4 py-2 text-sm font-medium w-full capitalize first:rounded-l-md last:rounded-r-md ${layer.patternType === type ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                         >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
            <Slider label={`Scale: ${layer.scale.toFixed(0)}`} min="5" max="100" step="1" value={layer.scale} onChange={(e) => handleUpdate({ scale: parseFloat(e.target.value) })} />
            <Slider label={`Angle: ${layer.angle}°`} min="0" max="180" value={layer.angle} onChange={(e) => handleUpdate({ angle: parseInt(e.target.value) })} />

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="text-sm font-medium text-gray-400">Background</span>
                    <HexColorPicker
                        className="!w-full my-2"
                        color={layer.backgroundColor}
                        onChange={(color) => handleUpdate({ backgroundColor: color })}
                    />
                </div>
                 <div>
                    <span className="text-sm font-medium text-gray-400">Foreground</span>
                    <HexColorPicker
                        className="!w-full my-2"
                        color={layer.foregroundColor}
                        onChange={(color) => handleUpdate({ foregroundColor: color })}
                    />
                </div>
            </div>
        </div>
    );
};

export default PatternEditor;
