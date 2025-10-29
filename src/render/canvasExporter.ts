
import * as FileSaver from 'file-saver';

export const exportToSVG = (svgString: string, filename: string = 'background.svg') => {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-g' });
  FileSaver.saveAs(blob, filename);
};

export const exportToPNG = (
  svgString: string,
  width: number,
  height: number,
  filename: string = 'background.png'
) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    alert('Canvas context could not be created. PNG export failed.');
    return;
  }

  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => {
      if (blob) {
        FileSaver.saveAs(blob, filename);
      }
    }, 'image/png');
  };

  img.onerror = (e) => {
    console.error("Error loading SVG image for PNG conversion:", e);
    alert("An error occurred while converting the SVG to PNG.");
    URL.revokeObjectURL(url);
  }

  img.src = url;
};