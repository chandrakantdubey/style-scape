
import seedrandom from 'seedrandom';

function rotatePoint(point: {x: number, y: number}, center: {x: number, y: number}, angle: number) {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const nx = (cos * (point.x - center.x)) - (sin * (point.y - center.y)) + center.x;
    const ny = (sin * (point.x - center.x)) + (cos * (point.y - center.y)) + center.y;
    return { x: nx, y: ny };
}

export function generateWavePath(
  seed: number,
  width: number,
  height: number,
  points: number,
  wavelength: number,
  amplitude: number,
  angle: number
): string {
    const rng = seedrandom(seed.toString());
    const frequency = width / wavelength;
    const yOffset = height / 2;

    const wavePoints: {x: number, y: number}[] = [];
    const step = width / (points > 1 ? points - 1 : 1);

    // Generate original points for the top edge of the wave shape
    wavePoints.push({ x: 0, y: yOffset });
    for (let i = 1; i < points; i++) {
        const x = i * step;
        const y = yOffset + Math.sin((x / width) * frequency * Math.PI * 2 + rng() * 0.5) * amplitude * (rng() * 0.4 + 0.8);
        wavePoints.push({ x, y });
    }

    // Define the corner points to close the path, creating a filled shape
    const pathPoints = [
        ...wavePoints,
        { x: width, y: height },
        { x: 0, y: height },
    ];
    
    // Rotate all points of the shape if an angle is provided
    if (angle !== 0) {
        // We rotate around the center of the original canvas space, not the wave shape itself,
        // to make the rotation feel more natural relative to the view.
        const center = { x: width / 2, y: height / 2 }; 
        for (let i = 0; i < pathPoints.length; i++) {
            pathPoints[i] = rotatePoint(pathPoints[i], center, angle);
        }
    }
    
    // Build the final SVG path string from the transformed points
    let path = `M ${pathPoints[0].x.toFixed(2)} ${pathPoints[0].y.toFixed(2)}`;
    for (let i = 1; i < pathPoints.length; i++) {
        path += ` L ${pathPoints[i].x.toFixed(2)} ${pathPoints[i].y.toFixed(2)}`;
    }
    path += ` Z`;
    
    return path;
}