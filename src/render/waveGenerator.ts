
import seedrandom from 'seedrandom';

export function generateWavePath(
  seed: number,
  width: number,
  height: number,
  points: number,
  wavelength: number,
  amplitude: number
): string {
    const rng = seedrandom(seed.toString());
    const frequency = width / wavelength;
    const yOffset = height / 2;

    let path = `M 0 ${yOffset}`;
    const step = width / (points - 1);

    for (let i = 1; i < points; i++) {
        const x = i * step;
        const y = yOffset + Math.sin((x / width) * frequency * Math.PI * 2 + rng() * 0.5) * amplitude * (rng() * 0.4 + 0.8);
        path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }

    path += ` L ${width} ${height} L 0 ${height} Z`;
    
    return path;
}
