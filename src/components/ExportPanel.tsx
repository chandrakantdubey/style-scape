
import React, { useMemo } from 'react';
import useStore from '../state/store';
import { renderSVG } from '../render/svgRenderer';
import { exportToSVG, exportToPNG } from '../render/canvasExporter';

const ExportPanel: React.FC = () => {
    const { appState } = useStore(state => ({
        appState: state.present,
    }));
    
    const svgString = useMemo(() => renderSVG(appState), [appState]);

    const handleExportSVG = () => {
        exportToSVG(svgString);
    };

    const handleExportPNG = () => {
        exportToPNG(svgString, appState.canvas.width, appState.canvas.height);
    };

    return (
        <div className="p-4 bg-gray-900 border-t border-gray-700">
            <h2 className="text-lg font-bold mb-4">Export</h2>
            <div className="space-y-2">
                <button onClick={handleExportSVG} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                    Export as SVG
                </button>
                <button onClick={handleExportPNG} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">
                    Export as PNG
                </button>
            </div>
        </div>
    );
};

export default ExportPanel;
