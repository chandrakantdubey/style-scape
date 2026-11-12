import { CircleDot, Eye, EyeOff, Grid3X3, MoveDown, MoveUp, Orbit, Trash2, Waves } from "lucide-react";
import type { SceneLayer, SceneLayerKind, Scene } from "@/runtime/stylescape-runtime.js";

const LAYER_TYPES: { kind: SceneLayerKind; label: string; icon: typeof Orbit }[] = [
  { kind: "orbits", label: "Orbit rings", icon: Orbit },
  { kind: "contours", label: "Flow contours", icon: Waves },
  { kind: "grid", label: "Wavy grid", icon: Grid3X3 },
];

export function LayerStack({ layers, palette, onChange, onPreview }: {
  layers: SceneLayer[];
  palette: Scene["palette"];
  onChange: (layers: SceneLayer[]) => void;
  onPreview: (layers: SceneLayer[]) => void;
}) {
  function add(kind: SceneLayerKind) {
    if (layers.length >= 12) return;
    onChange([...layers, {
      id: `l${Date.now().toString(36)}${Math.floor(Math.random() * 0xFFFFFF).toString(36)}`,
      kind, visible: true, opacity: 0.38, colorIndex: Math.min(2, palette.colors.length - 1), detail: kind === "orbits" ? 12 : 14, blend: "normal",
    }]);
  }
  function update(id: string, patch: Partial<SceneLayer>, preview = false) {
    const next = layers.map((layer) => layer.id === id ? { ...layer, ...patch } : layer);
    (preview ? onPreview : onChange)(next);
  }
  function move(index: number, delta: -1 | 1) {
    const next = [...layers];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return <div className="space-y-3" data-testid="panel-layer-stack">
    <div className="flex flex-wrap gap-1.5">
      {LAYER_TYPES.map(({ kind, label, icon: Icon }) => (
        <button key={kind} type="button" data-testid={`button-add-layer-${kind}`} disabled={layers.length >= 12} onClick={() => add(kind)} className="inline-flex items-center gap-1 rounded border border-border px-2 py-1.5 text-[10px] font-semibold transition hover:border-primary disabled:opacity-45">
          <Icon className="h-3 w-3" />{label}
        </button>
      ))}
    </div>
    {layers.length === 0 ? <p className="rounded border border-dashed p-3 text-xs text-muted-foreground">Add editable SVG linework over your generated field. Drag-free controls let you reorder, tune, hide, or remove each layer.</p> :
      <ol className="space-y-2">
        {layers.map((layer, index) => {
          const meta = LAYER_TYPES.find((item) => item.kind === layer.kind)!;
          const Icon = meta.icon;
          return <li key={layer.id} data-testid={`row-layer-${layer.id}`} className="rounded border border-border p-2.5">
            <div className="mb-2 flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">{meta.label} <span className="font-normal text-muted-foreground">· {index + 1}</span></span>
              <button type="button" aria-label={`${layer.visible ? "Hide" : "Show"} ${meta.label}`} data-testid={`button-toggle-layer-${layer.id}`} aria-pressed={layer.visible} onClick={() => update(layer.id, { visible: !layer.visible })} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">{layer.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
              <button type="button" aria-label={`Move ${meta.label} up`} data-testid={`button-layer-up-${layer.id}`} disabled={index === 0} onClick={() => move(index, -1)} className="rounded p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30"><MoveUp className="h-3.5 w-3.5" /></button>
              <button type="button" aria-label={`Move ${meta.label} down`} data-testid={`button-layer-down-${layer.id}`} disabled={index === layers.length - 1} onClick={() => move(index, 1)} className="rounded p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30"><MoveDown className="h-3.5 w-3.5" /></button>
              <button type="button" aria-label={`Remove ${meta.label}`} data-testid={`button-remove-layer-${layer.id}`} onClick={() => onChange(layers.filter((item) => item.id !== layer.id))} className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[10px] text-muted-foreground">Ink
                <select data-testid={`select-layer-color-${layer.id}`} value={layer.colorIndex} onChange={(e) => update(layer.id, { colorIndex: Number(e.target.value) })} className="mt-1 block w-full rounded border bg-background px-2 py-1.5 text-foreground">
                  {palette.colors.map((color, index) => <option key={`${color}-${index}`} value={index}>Ink {index + 1} · {color}</option>)}
                </select>
              </label>
              <label className="text-[10px] text-muted-foreground">Blend
                <select data-testid={`select-layer-blend-${layer.id}`} value={layer.blend} onChange={(e) => update(layer.id, { blend: e.target.value as SceneLayer["blend"] })} className="mt-1 block w-full rounded border bg-background px-2 py-1.5 text-foreground">
                  <option value="normal">Normal</option><option value="multiply">Multiply</option><option value="additive">Additive</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-[10px] text-muted-foreground">Opacity
                <input data-testid={`input-layer-opacity-${layer.id}`} type="range" min="0" max="1" step="0.01" value={layer.opacity} onChange={(e) => update(layer.id, { opacity: Number(e.target.value) }, true)} onPointerUp={() => onChange(layers)} onKeyUp={() => onChange(layers)} onBlur={() => onChange(layers)} className="min-w-0 flex-1 accent-[hsl(var(--primary))]" />
                <span className="w-8 font-mono text-right">{Math.round(layer.opacity * 100)}%</span>
              </label>
              <label className="flex items-center gap-2 text-[10px] text-muted-foreground">Detail
                <input data-testid={`input-layer-detail-${layer.id}`} type="range" min="4" max="48" step="1" value={layer.detail} onChange={(e) => update(layer.id, { detail: Number(e.target.value) }, true)} onPointerUp={() => onChange(layers)} onKeyUp={() => onChange(layers)} onBlur={() => onChange(layers)} className="min-w-0 flex-1 accent-[hsl(var(--primary))]" />
                <span className="w-6 font-mono text-right">{layer.detail}</span>
              </label>
            </div>
          </li>;
        })}
      </ol>}
    <p className="flex items-start gap-1.5 text-[10px] text-muted-foreground"><CircleDot className="mt-0.5 h-3 w-3 shrink-0" />Layers stay editable in scene JSON and are exported as real SVG paths. Maximum 12 layers.</p>
  </div>;
}
