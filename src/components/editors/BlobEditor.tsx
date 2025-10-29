
import React from 'react';
import { HexColorPicker } from 'react-colorful';
import useStore from '../../state/store';
import type { BlobLayer } from '../../state/types';

interface BlobEditorProps {
    layer: BlobLayer;
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

const BlobEditor: React.FC<BlobEditorProps> = ({ layer }) => {
    const updateLayer = useStore((state) => state.updateLayer);

    const handleUpdate = (newProps: Partial<BlobLayer>) => {
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
            <Slider label={`Points: ${layer.points}`} min="3" max="20" step="1" value={layer.points} onChange={(e) => handleUpdate({ points: parseInt(e.target.value, 10) })} />
            <Slider label={`Chaos: ${layer.chaos.toFixed(2)}`} min="0" max="1" step="0.01" value={layer.chaos} onChange={(e) => handleUpdate({ chaos: parseFloat(e.target.value) })} />
            <Slider label={`Scale: ${layer.scale.toFixed(2)}`} min="0.1" max="2" step="0.01" value={layer.scale} onChange={(e) => handleUpdate({ scale: parseFloat(e.target.value) })} />
            <Slider label={`X Position: ${layer.x.toFixed(2)}`} min="0" max="1" step="0.01" value={layer.x} onChange={(e) => handleUpdate({ x: parseFloat(e.target.value) })} />
            <Slider label={`Y Position: ${layer.y.toFixed(2)}`} min="0" max="1" step="0.01" value={layer.y} onChange={(e) => handleUpdate({ y: parseFloat(e.target.value) })} />
        </div>
    );
};

export default BlobEditor;
