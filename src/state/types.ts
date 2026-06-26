/**
 * Core type system for StyleScape.
 *
 * A `Preset` is a self-contained, pure value that renders deterministically
 * given the same canvas + layers. Every layer is one of a small union of
 * shapes; `svgRenderer.ts` knows how to turn the union into SVG.
 */

export interface CanvasState {
  width: number;
  height: number;
  background: string;
}

export enum LayerType {
  GRADIENT = "gradient",
  BLOB = "blob",
  WAVE = "wave",
  PATTERN = "pattern",
  IMAGE = "image",
}

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  opacity: number;
  blendMode: string;
}

export interface GradientStop {
  id: string;
  color: string;
  offset: number;
}

export interface GradientLayer extends BaseLayer {
  type: LayerType.GRADIENT;
  gradientType: "linear" | "radial";
  angle: number;
  stops: GradientStop[];
  cx?: number;
  cy?: number;
  r?: number;
}

export interface BlobLayer extends BaseLayer {
  type: LayerType.BLOB;
  color: string;
  seed: number;
  points: number;
  chaos: number;
  x: number;
  y: number;
  scale: number;
}

export interface WaveLayer extends BaseLayer {
  type: LayerType.WAVE;
  color: string;
  seed: number;
  points: number;
  wavelength: number;
  amplitude: number;
  y: number;
  angle: number;
}

export interface PatternLayer extends BaseLayer {
  type: LayerType.PATTERN;
  patternType:
    | "dots"
    | "lines"
    | "squares"
    | "triangles"
    | "hexagons"
    | "chevrons"
    | "crosses";
  backgroundColor: string;
  foregroundColor: string;
  scale: number;
  angle: number;
}

export interface ImageLayer extends BaseLayer {
  type: LayerType.IMAGE;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Layer =
  | GradientLayer
  | BlobLayer
  | WaveLayer
  | PatternLayer
  | ImageLayer;

export interface AppState {
  layers: Layer[];
  canvas: CanvasState;
  selectedLayerId: string | null;
}

export type PresetTheme = "light" | "dark";

export type PresetCategory =
  | "Gradients"
  | "Waves"
  | "Grid"
  | "Glassmorphism"
  | "Abstract"
  | "Mesh"
  | "Stripes"
  | "Mosaic"
  | "Dots"
  | "Plasma"
  | "Noise"
  | "Topo"
  | "Bauhaus";

export interface Preset {
  id: string;
  name: string;
  category: PresetCategory;
  theme: PresetTheme;
  isNew?: boolean;
  canvas: CanvasState;
  layers: Layer[];
}

/**
 * Extended app state with a schema version. The migrator in
 * `utils/migrateAppState.ts` stamps `schemaVersion: 2` so future
 * format changes can be detected without breaking old persisted state.
 */
export type AppStateV2 = AppState & {
  schemaVersion?: 2;
};
