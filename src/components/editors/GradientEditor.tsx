
import React from 'react';
import { HexColorPicker } from 'react-colorful';
import useStore from '../../state/store';
import type { GradientLayer, GradientStop } from '../../state/types';

interface GradientEditorProps {
    layer: GradientLayer;
}

const GradientEditor: React.FC<GradientEditorProps> = ({ layer }) => {
    const updateLayer = useStore((state) => state.updateLayer);
    
    const handleUpdate = (newProps: Partial<GradientLayer>) => {
        updateLayer(layer.id, newProps);
    };

    const handleStopChange = (stopId: string, newProps: Partial<GradientStop>) => {
        const newStops = layer.stops.map(stop => 
            stop.id === stopId ? { ...stop, ...newProps } : stop
        );
        handleUpdate({ stops: newStops });
    };

    const addStop = () => {
        const newStop: GradientStop = {
            id: `stop-${Date.now()}`,
            color: '#ffffff',
            offset: 50,
        };
        const newStops = [...layer.stops, newStop].sort((a, b) => a.offset - b.offset);
        handleUpdate({ stops: newStops });
    };

    const removeStop = (stopId: string) => {
        if (layer.stops.length <= 2) return;
        const newStops = layer.stops.filter(s => s.id !== stopId);
        handleUpdate({ stops: newStops });
    };

    return (
        <div className="space-y-4">
            <div>
                <span className="text-sm font-medium text-gray-400">Type</span>
                <div className="flex mt-1 rounded-md shadow-sm">
                    <button onClick={() => handleUpdate({ gradientType: 'linear' })} className={`px-4 py-2 text-sm font-medium rounded-l-md w-full ${layer.gradientType === 'linear' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Linear</button>
                    <button onClick={() => handleUpdate({ gradientType: 'radial' })} className={`px-4 py-2 text-sm font-medium rounded-r-md w-full ${layer.gradientType === 'radial' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Radial</button>
                </div>
            </div>
            {layer.gradientType === 'linear' && (
                <div>
                    <label className="block text-sm font-medium text-gray-400">Angle: {layer.angle}°</label>
                    <input type="range" min="0" max="360" value={layer.angle} onChange={(e) => handleUpdate({ angle: parseInt(e.target.value, 10) })} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                </div>
            )}
            
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-400">Color Stops</h3>
                    <button onClick={addStop} className="text-sm bg-indigo-600 hover:bg-indigo-700 rounded px-2 py-1">+ Add</button>
                </div>
                {layer.stops.map(stop => (
                    <div key={stop.id} className="p-2 bg-gray-800 rounded">
                        <HexColorPicker color={stop.color} onChange={(color) => handleStopChange(stop.id, { color })} className="!w-full mb-2" />
                        <div className="flex items-center space-x-2">
                            <input type="range" min="0" max="100" value={stop.offset} onChange={(e) => handleStopChange(stop.id, { offset: parseInt(e.target.value, 10) })} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                            <span className="text-xs w-8 text-right">{stop.offset}%</span>
                            <button onClick={() => removeStop(stop.id)} disabled={layer.stops.length <= 2} className="text-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GradientEditor;