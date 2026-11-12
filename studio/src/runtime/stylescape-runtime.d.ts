export type BlendMode = "normal" | "additive" | "multiply";
export type SceneLayerKind = "orbits" | "contours" | "grid";
export interface SceneLayer {
  id: string;
  kind: SceneLayerKind;
  visible: boolean;
  opacity: number;
  colorIndex: number;
  detail: number;
  blend: BlendMode;
}
export interface SceneParams {
  count: number; steps: number; stepLength: number; noiseScale: number; octaves: number;
  curl: number; warp: number; flowAngle: number; width: number; taper: number; opacity: number;
  colorSpread: number; interference: number; rings: number; sources: number; grain: number;
  drift: number; vignette: number;
}
export type ParamKey = keyof SceneParams;
export interface Scene {
  version: 2;
  name: string;
  seed: number;
  fieldMode: "curl" | "orbit" | "contour";
  layers: SceneLayer[];
  blend: BlendMode;
  params: SceneParams;
  palette: { background: string; colors: string[] };
}
export interface RenderStats {
  renderer: "webgl" | "canvas2d";
  fallbackReason: string | null;
  ribbons: number; vertices: number; buildMs: number;
  width: number; height: number; animated: boolean;
}
export interface StyleScapeOptions {
  maxDpr?: number; animate?: boolean; renderer?: "auto" | "webgl" | "canvas2d";
  width?: number; height?: number;
  onError?: (e: Error) => void; onStats?: (s: RenderStats) => void;
}
export interface StyleScapeInstance {
  readonly renderer: "webgl" | "canvas2d";
  readonly scene: Scene;
  stats(): RenderStats;
  update(scene: Scene): void;
  resize(): void;
  renderNow(): void;
  toDataURL(type?: string): string;
  dispose(): void;
}
export const RUNTIME_VERSION: string;
export const SCENE_VERSION: 2;
export const LIMITS: { count: [number, number]; steps: [number, number]; maxVertices: number; maxCanvasEdge: number; maxDpr: number };
export const PARAM_SPEC: Record<ParamKey, { min: number; max: number; step: number; def: number }>;
export const BLEND_MODES: BlendMode[];
export function defaultScene(): Scene;
export function validateScene(input: unknown): { ok: boolean; scene: Scene; errors: string[] };
export function buildGeometry(scene: Scene, aspect: number): { data: Float32Array; vertexCount: number; ribbons: number; steps: number; ranges: number[] };
export function vectorLayersMarkup(scene: Scene, width: number, height: number): string;
export function vectorLayersSvg(scene: Scene, width: number, height: number): string;
export function buildVectorSvg(scene: Scene, width?: number, height?: number): string;
export function mulberry32(seed: number): () => number;
export function createStyleScape(canvas: HTMLCanvasElement, scene: Scene, options?: StyleScapeOptions): StyleScapeInstance;
export function renderToDataURL(scene: Scene, width: number, height: number, renderer?: "auto" | "webgl" | "canvas2d"): string;
