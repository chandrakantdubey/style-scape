export const SVG_DATA_URL_PREFIX = "data:image/svg+xml;charset=utf-8,";

export function clamp(value: number | undefined, min: number, max: number, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}

export function formatNumber(value: number, precision = 3): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return Number(value.toFixed(precision)).toString();
}

export function escapeSvgAttribute(value: string | number | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function svgToDataUrl(svgString: string): string {
  return `${SVG_DATA_URL_PREFIX}${encodeURIComponent(svgString)}`;
}

