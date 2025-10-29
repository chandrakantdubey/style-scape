import React from 'react';
import useStore from '../state/store';
import { LayerType } from '../state/types';

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.02 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);
const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2 2 0 01-2.828 2.828l-1.514-1.514a4 4 0 005.576 5.576l1.514 1.514a2 2 0 01-2.828 2.828l-1.514-1.514a4 4 0 00-5.576-5.576z" clipRule="evenodd" />
        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.746-3.746L2.303 3.546A1 1 0 013.717 2.13l14.142 14.142a1 1 0 01-1.405 1.425z" />
    </svg>
);

const LayerList: React.FC = () => {
    const { layers, selectedLayerId, selectLayer, removeLayer, updateLayer, addLayer, reorderLayer } = useStore(state => ({
        layers: state.present.layers,
        selectedLayerId: state.present.selectedLayerId,
        selectLayer: state.selectLayer,
        removeLayer: state.removeLayer,
        updateLayer: state.updateLayer,
        addLayer: state.addLayer,
        reorderLayer: state.reorderLayer,
    }));

    return (
        <div className="w-64 bg-gray-900 flex flex-col p-2 space-y-2 border-r border-gray-700">
            <h2 className="text-lg font-bold px-2">Layers</h2>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => addLayer(LayerType.GRADIENT)} className="w-full text-sm bg-indigo-600 hover:bg-indigo-700 rounded p-2 transition-colors">+ Gradient</button>
                <button onClick={() => addLayer(LayerType.BLOB)} className="w-full text-sm bg-purple-600 hover:bg-purple-700 rounded p-2 transition-colors">+ Blob</button>
                <button onClick={() => addLayer(LayerType.WAVE)} className="w-full text-sm bg-teal-600 hover:bg-teal-700 rounded p-2 transition-colors">+ Wave</button>
                <button onClick={() => addLayer(LayerType.PATTERN)} className="w-full text-sm bg-green-600 hover:bg-green-700 rounded p-2 transition-colors">+ Pattern</button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-1 pr-1">
                {layers.map((layer) => (
                    <div
                        key={layer.id}
                        onClick={() => selectLayer(layer.id)}
                        className={`group flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${selectedLayerId === layer.id ? 'bg-indigo-500/50' : 'hover:bg-gray-700/50'}`}
                    >
                        <span className="truncate flex-grow">{layer.name}</span>
                        <div className="flex items-center space-x-1 text-gray-400">
                            <button onClick={(e) => { e.stopPropagation(); reorderLayer(layer.id, 'up'); }} className="p-1 rounded hover:bg-gray-600">▲</button>
                            <button onClick={(e) => { e.stopPropagation(); reorderLayer(layer.id, 'down'); }} className="p-1 rounded hover:bg-gray-600">▼</button>
                            <button onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }} className="p-1 rounded hover:bg-gray-600">
                                {layer.visible ? <EyeIcon /> : <EyeOffIcon />}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }} className="p-1 rounded text-red-500 hover:bg-red-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LayerList;