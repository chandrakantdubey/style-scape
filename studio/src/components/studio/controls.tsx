import { useEffect, useRef, useState, type ReactNode } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Lock, LockOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { createStyleScape, type RenderStats, type Scene, type StyleScapeInstance } from "@/runtime/stylescape-runtime.js";

export function StageCanvas({ scene, onStats, onError, className }: {
  scene: Scene;
  onStats?: (s: RenderStats) => void;
  onError?: (msg: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const inst = useRef<StyleScapeInstance | null>(null);
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  const statsRef = useRef(onStats);
  statsRef.current = onStats;
  const errRef = useRef(onError);
  errRef.current = onError;

  useEffect(() => {
    if (!ref.current) return;
    try {
      inst.current = createStyleScape(ref.current, sceneRef.current, {
        maxDpr: 2,
        onStats: (s) => statsRef.current?.(s),
        onError: (e) => errRef.current?.(e.message),
      });
      statsRef.current?.(inst.current.stats());
    } catch (e) {
      errRef.current?.(e instanceof Error ? e.message : String(e));
    }
    return () => {
      inst.current?.dispose();
      inst.current = null;
    };
  }, []);

  useEffect(() => {
    inst.current?.update(scene);
  }, [scene]);

  return <canvas ref={ref} data-testid="canvas-stage" className={cn("block h-full w-full", className)} aria-label={`Rendered scene ${scene.name}`} />;
}

export function ParamSlider({ label, hint, value, min, max, step, fmt, onChange, onCommit, id }: {
  id: string;
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  fmt?: (v: number) => string;
  onChange: (v: number) => void;
  onCommit: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const display = fmt ? fmt(value) : step >= 1 ? String(Math.round(value)) : value.toFixed(2);
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="group py-1.5" title={hint}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className="text-[13px] font-medium tracking-tight text-foreground/85">{label}</label>
        {editing ? (
          <input
            autoFocus
            data-testid={`input-param-${id}`}
            className="w-20 rounded-sm border border-input bg-card px-1 text-right font-mono text-[11px] outline-none focus:border-primary"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              const n = Number(draft);
              if (Number.isFinite(n)) onCommit(Math.min(max, Math.max(min, n)));
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") setEditing(false);
            }}
          />
        ) : (
          <button
            type="button"
            data-testid={`button-edit-${id}`}
            onClick={() => {
              setDraft(String(value));
              setEditing(true);
            }}
            className="rounded-sm px-1 font-mono text-[11px] tabular-nums text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {display}
          </button>
        )}
      </div>
      <SliderPrimitive.Root
        data-testid={`slider-${id}`}
        className="relative flex h-4 w-full touch-none select-none items-center"
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        onValueCommit={(v) => onCommit(v[0])}
        aria-label={label}
      >
        <SliderPrimitive.Track className="relative h-[3px] w-full grow overflow-hidden rounded-full bg-foreground/10">
          <SliderPrimitive.Range className="absolute h-full bg-foreground" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-3.5 w-3.5 rounded-[3px] border-2 border-foreground bg-card shadow-[0_1px_0_hsl(var(--foreground)/0.3)] transition-transform hover:scale-125 focus-visible:scale-125 focus-visible:border-primary focus-visible:outline-none active:bg-primary" />
      </SliderPrimitive.Root>
      <div className="pointer-events-none mt-1 flex justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/70">
        <span>{min}</span>
        <span>{pct.toFixed(0)}%</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export function Section({ title, index, locked, onToggleLock, children }: {
  title: string;
  index: string;
  locked?: boolean;
  onToggleLock?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border/80 px-5 py-4">
      <header className="mb-2 flex items-center justify-between">
        <h3 className="flex items-baseline gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
          <span className="font-mono text-primary">{index}</span>
          {title}
        </h3>
        {onToggleLock && (
          <button
            type="button"
            onClick={onToggleLock}
            data-testid={`button-lock-${title.toLowerCase()}`}
            aria-pressed={locked}
            title={locked ? "Locked: variations keep these values" : "Unlocked: variations may change these"}
            className={cn(
              "flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-all active:scale-95",
              locked ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
            )}
          >
            {locked ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
            {locked ? "Locked" : "Free"}
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

export function Swatches({ colors, background, size = "sm" }: { colors: string[]; background: string; size?: "sm" | "md" }) {
  return (
    <span className={cn("inline-flex overflow-hidden rounded-[3px] ring-1 ring-foreground/15", size === "sm" ? "h-3.5" : "h-5")}>
      <span className={size === "sm" ? "w-3" : "w-5"} style={{ background }} />
      {colors.map((c, i) => (
        <span key={i} className={size === "sm" ? "w-2" : "w-4"} style={{ background: c }} />
      ))}
    </span>
  );
}
