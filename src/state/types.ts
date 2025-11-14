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

// Fix: Define and export the AppState interface.
export interface AppState {
  layers: Layer[];
  canvas: CanvasState;
  selectedLayerId: string | null;
}

export type PresetTheme = "light" | "dark" | "colored";

export type PresetCategory =
  | "Gradients"
  | "Decorative"
  | "Geometric"
  | "Minimalist"
  | "Waves"
  | "Abstract"
  | "Metallic"
  | "Grid"
  | "Glassmorphism"
  | "Texture"
  | "Particles"
  | "Mesh"
  | "Stripe"
  | "Mixed";

export interface Preset {
  id: string;
  name: string;
  category: PresetCategory;
  theme: PresetTheme;
  isNew?: boolean;
  canvas: CanvasState;
  layers: Layer[];
}
