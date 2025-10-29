
import React, { useMemo } from 'react';
import useStore from '../state/store';
import { renderSVG } from '../render/svgRenderer';

const CanvasViewport: React.FC = () => {
  const appState = useStore((state) => state.present);
  const svgString = useMemo(() => renderSVG(appState), [appState]);

  return (
    <div className="flex-grow flex items-center justify-center p-4 md:p-8 bg-gray-800/50 rounded-lg overflow-hidden">
      <div
        className="shadow-2xl"
        style={{
            width: appState.canvas.width,
            height: appState.canvas.height,
            maxWidth: '100%',
            maxHeight: '100%',
            aspectRatio: `${appState.canvas.width} / ${appState.canvas.height}`,
        }}
        dangerouslySetInnerHTML={{ __html: svgString }}
      />
    </div>
  );
};

export default CanvasViewport;
