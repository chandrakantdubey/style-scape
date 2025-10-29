
import seedrandom from 'seedrandom';

function angle(index: number, total: number) {
  return (index / total) * Math.PI * 2;
}

function random(rng: () => number, min: number, max: number) {
  return rng() * (max - min) + min;
}

function controlPoint(
  rng: () => number,
  current: [number, number],
  previous: [number, number],
  next: [number, number],
  chaos: number
): [number, number] {
  const opposedLine = {
    x: next[0] - previous[0],
    y: next[1] - previous[1],
  };
  const length = Math.sqrt(Math.pow(opposedLine.x, 2) + Math.pow(opposedLine.y, 2));
  const angle = Math.atan2(opposedLine.y, opposedLine.x);
  const chaoticAngle = angle + random(rng, -chaos, chaos);
  const chaoticLength = length * random(rng, 0.15, 0.35);

  return [
    current[0] + Math.cos(chaoticAngle) * chaoticLength,
    current[1] + Math.sin(chaoticAngle) * chaoticLength,
  ];
}

export function generateBlobPath(
  seed: number,
  numPoints: number,
  chaos: number,
  size: number
): string {
  const rng = seedrandom(seed.toString());
  const radius = size / 2;
  const points: [number, number][] = [];

  for (let i = 0; i < numPoints; i++) {
    const pointAngle = angle(i, numPoints);
    const pointRadius = radius * random(rng, 0.75, 1.05);
    points.push([
      radius + Math.cos(pointAngle) * pointRadius,
      radius + Math.sin(pointAngle) * pointRadius,
    ]);
  }

  let path = `M ${points[0][0]} ${points[0][1]}`;

  for (let i = 0; i < numPoints; i++) {
    const p0 = points[(i - 1 + numPoints) % numPoints];
    const p1 = points[i];
    const p2 = points[(i + 1) % numPoints];
    const p3 = points[(i + 2) % numPoints];

    const cp1 = controlPoint(rng, p1, p0, p2, chaos);
    const cp2 = controlPoint(rng, p2, p1, p3, chaos).map((n, j) => p2[j] - (n - p2[j])); // Reflect

    path += ` C ${cp1[0]} ${cp1[1]}, ${cp2[0]} ${cp2[1]}, ${p2[0]} ${p2[1]}`;
  }

  return path;
}
