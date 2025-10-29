import React from 'react';
import { HexColorPicker } from 'react-colorful';
import useStore from '../../state/store';
import type { WaveLayer } from '../../state/types';

interface WaveEditorProps {
    layer: WaveLayer;
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

const WaveEditor: React.FC<WaveEditorProps> = ({ layer }) => {
    const updateLayer = useStore((state) => state.updateLayer);

    const handleUpdate = (newProps: Partial<WaveLayer>) => {
        updateLayer(layer.id, newProps);
    };

    return (
        <div className="space-y-4">
            <div>
                <span className="text-sm font-medium text-gray-400">Color</span>
                <HexColorPicker
                    className="!w-full my-2"
                    color={layer.color}
                    onChange={(color) => handleUpdate({ color })}
                />
            </div>
            <Slider label={`Seed: ${layer.seed.toFixed(0)}`} min="0" max="1000" step="1" value={layer.seed} onChange={(e) => handleUpdate({ seed: parseFloat(e.target.value) })} />
            <Slider label={`Points: ${layer.points}`} min="2" max="50" step="1" value={layer.points} onChange={(e) => handleUpdate({ points: parseInt(e.target.value, 10) })} />
            <Slider label={`Wavelength: ${layer.wavelength.toFixed(0)}`} min="10" max="500" step="1" value={layer.wavelength} onChange={(e) => handleUpdate({ wavelength: parseFloat(e.target.value) })} />
            <Slider label={`Amplitude: ${layer.amplitude.toFixed(0)}`} min="0" max="100" step="1" value={layer.amplitude} onChange={(e) => handleUpdate({ amplitude: parseFloat(e.target.value) })} />
            <Slider label={`Y Position: ${layer.y.toFixed(2)}`} min="0" max="1" step="0.01" value={layer.y} onChange={(e) => handleUpdate({ y: parseFloat(e.target.value) })} />
        </div>
    );
};

export default WaveEditor;
