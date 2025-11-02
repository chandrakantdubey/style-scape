export const getAverageLuminance = (
  svgString: string,
  width: number,
  height: number
): Promise<number> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    // Use a smaller canvas for performance
    const sampleWidth = 100;
    const sampleHeight = (height / width) * sampleWidth;
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      return reject(new Error('Canvas context could not be created.'));
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
      URL.revokeObjectURL(url);
      
      try {
        const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
        const data = imageData.data;
        let totalLuminance = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Luminance formula
          const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          totalLuminance += luminance;
        }

        const avgLuminance = totalLuminance / (sampleWidth * sampleHeight);
        resolve(avgLuminance);
      } catch (e) {
        reject(new Error('Could not get image data for luminance calculation.'));
      }
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image for color analysis.'));
    };

    img.src = url;
  });
};
