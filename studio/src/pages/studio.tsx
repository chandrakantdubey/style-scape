import { useCallback, useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { Dices, Download, FolderOpen, Redo2, Save, Shuffle, Trash2, Undo2, Upload, ChevronLeft, ChevronRight, Sparkles, Cpu, Cloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ParamSlider, Section, StageCanvas, Swatches } from "@/components/studio/controls";
import { ExportDialog } from "@/components/studio/export-dialog";
import { LOCK_GROUPS, PALETTES, PARAM_LABELS, PRESETS, variations, type LockGroup } from "@/lib/scenes";
import { loadLibrary, persistLibrary, LIBRARY_LIMIT, type SavedScene } from "@/lib/storage";
import { BLEND_MODES, PARAM_SPEC, renderToDataURL, validateScene, type ParamKey, type RenderStats, type Scene } from "@/runtime/stylescape-runtime.js";
import { CloudLibrary } from "@/components/studio/cloud-library";
import { LayerStack } from "@/components/studio/layer-stack";

/* ---------------- history ---------------- */
type H = { past: Scene[]; present: Scene; future: Scene[]; anchor: Scene | null };
type A = { t: "preview"; s: Scene } | { t: "commit"; s: Scene } | { t: "undo" } | { t: "redo" };
function hist(st: H, a: A): H {
  switch (a.t) {
    case "preview":
      return { ...st, anchor: st.anchor ?? st.present, present: a.s };
    case "commit": {
      const prev = st.anchor ?? st.present;
      if (JSON.stringify(prev) === JSON.stringify(a.s)) return { ...st, present: a.s, anchor: null };
      return { past: [...st.past, prev].slice(-80), present: a.s, future: [], anchor: null };
    }
    case "undo":
      if (!st.past.length) return st;
      return { past: st.past.slice(0, -1), present: st.past[st.past.length - 1], future: [st.present, ...st.future], anchor: null };
    case "redo":
      if (!st.future.length) return st;
      return { past: [...st.past, st.present], present: st.future[0], future: st.future.slice(1), anchor: null };
  }
}

const SECTIONS: { group: LockGroup; title: string; idx: string }[] = [
  { group: "field", title: "Field", idx: "01" },
  { group: "ribbons", title: "Ribbons", idx: "02" },
  { group: "interference", title: "Interference", idx: "04" },
  { group: "motion", title: "Motion", idx: "05" },
];

const THUMB_W = 240, THUMB_H = 150;
const MAX_IMPORT_BYTES = 256 * 1024;

export default function Studio() {
  const { toast } = useToast();
  const [h, dispatch] = useReducer(hist, undefined, () => ({ past: [], present: structuredClone(PRESETS[0].scene), future: [], anchor: null }));
  const scene = h.present;
  const sceneRef = useRef(scene);
  sceneRef.current = scene;

  const [stats, setStats] = useState<RenderStats | null>(null);
  const [locks, setLocks] = useState<Set<LockGroup>>(() => new Set());
  const [amount, setAmount] = useState(0.45);
  const [vars, setVars] = useState<{ scene: Scene; thumb: string }[]>([]);
  const [generating, setGenerating] = useState(false);
  const salt = useRef(1);
  const [library, setLibrary] = useState<SavedScene[]>([]);
  const [leftTab, setLeftTab] = useState<"presets" | "library">("presets");
  const [exportOpen, setExportOpen] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [cloudOpen, setCloudOpen] = useState(false);
  const [cloudSelected, setCloudSelected] = useState<{ id: string; revision: number } | null>(null);
  const [frameRatio, setFrameRatio] = useState("16 / 9");
  const [contentGuides, setContentGuides] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const reportedFallback = useRef(false);

  useEffect(() => {
    const r = loadLibrary();
    setLibrary(r.items);
    if (r.error) toast({ variant: "destructive", title: "Library", description: r.error });
    try {
      const incoming = sessionStorage.getItem("stylescape.v2.shared-import");
      if (incoming) {
        sessionStorage.removeItem("stylescape.v2.shared-import");
        const parsed = validateScene(JSON.parse(incoming));
        if (parsed.ok) dispatch({ t: "commit", s: parsed.scene });
      }
    } catch { sessionStorage.removeItem("stylescape.v2.shared-import"); }
  }, [toast]);

  const commit = useCallback((s: Scene) => dispatch({ t: "commit", s }), []);
  const preview = useCallback((s: Scene) => dispatch({ t: "preview", s }), []);
  const setParam = (k: ParamKey, v: number, final: boolean) => {
    const s = { ...sceneRef.current, params: { ...sceneRef.current.params, [k]: v } };
    (final ? commit : preview)(s);
  };
  const toggleLock = (g: LockGroup) =>
    setLocks((prev) => {
      const n = new Set(prev);
      if (n.has(g)) n.delete(g);
      else n.add(g);
      return n;
    });

  const reseed = useCallback((delta?: number) => {
    const s = sceneRef.current;
    const seed = delta ? Math.max(1, s.seed + delta) : Math.floor(Math.random() * 999999) + 1;
    commit({ ...s, seed });
  }, [commit]);

  const generate = useCallback(() => {
    setGenerating(true);
    salt.current += 1;
    const list = variations(sceneRef.current, locks, amount, 6, salt.current);
    setVars(list.map((s) => ({ scene: s, thumb: "" })));
    let i = 0;
    const step = () => {
      if (i >= list.length) {
        setGenerating(false);
        return;
      }
      const idx = i++;
      let thumb = "";
      try {
        thumb = renderToDataURL(list[idx], THUMB_W, THUMB_H);
      } catch {
        thumb = "";
      }
      setVars((prev) => prev.map((v, j) => (j === idx ? { ...v, thumb } : v)));
      setTimeout(step, 16);
    };
    setTimeout(step, 16);
  }, [locks, amount]);

  const saveScene = useCallback(() => {
    const s = sceneRef.current;
    let thumb = "";
    try {
      thumb = renderToDataURL(s, THUMB_W, THUMB_H);
    } catch {
      thumb = "";
    }
    const existing = library.find((x) => x.id === savedId);
    const item: SavedScene = { id: existing?.id ?? `s${Date.now().toString(36)}`, name: s.name, updatedAt: Date.now(), thumb, scene: structuredClone(s) };
    const next = [item, ...library.filter((x) => x.id !== item.id)];
    if (next.length > LIBRARY_LIMIT) {
      toast({ variant: "destructive", title: "Library full", description: `Limit is ${LIBRARY_LIMIT} scenes. Delete one first.` });
      return;
    }
    let err = persistLibrary(next);
    if (err && item.thumb) {
      item.thumb = "";
      err = persistLibrary(next);
    }
    if (err) {
      toast({ variant: "destructive", title: "Not saved", description: err });
      return;
    }
    setLibrary(next);
    setSavedId(item.id);
    setLeftTab("library");
    toast({ title: existing ? "Scene updated" : "Scene saved", description: `${s.name} is stored in this browser.` });
  }, [library, savedId, toast]);

  const deleteSaved = (id: string) => {
    const next = library.filter((x) => x.id !== id);
    const err = persistLibrary(next);
    if (err) {
      toast({ variant: "destructive", title: "Delete failed", description: err });
      return;
    }
    setLibrary(next);
    if (savedId === id) setSavedId(null);
  };

  const onImport = async (f: File | undefined) => {
    if (!f) return;
    try {
      if (f.size > MAX_IMPORT_BYTES) throw new Error(`File is ${(f.size / 1024).toFixed(0)} KB; limit is 256 KB.`);
      const text = await f.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("File is not valid JSON.");
      }
      const v = validateScene(parsed);
      if (!v.ok) throw new Error(v.errors.slice(0, 3).join(" "));
      commit(v.scene);
      setSavedId(null);
      toast({ title: "Scene imported", description: v.errors.length ? v.errors.slice(0, 2).join(" ") : v.scene.name });
    } catch (e) {
      toast({ variant: "destructive", title: "Import rejected", description: e instanceof Error ? e.message : String(e) });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        if (typing) return;
        e.preventDefault();
        dispatch({ t: e.shiftKey ? "redo" : "undo" });
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        dispatch({ t: "redo" });
      } else if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveScene();
      } else if (!mod && !typing && e.key === "r") reseed();
      else if (!mod && !typing && e.key === "v") generate();
      else if (!mod && !typing && e.key === "e") setExportOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saveScene, reseed, generate]);

  const P = scene.params;
  const slider = (k: ParamKey) => {
    const spec = PARAM_SPEC[k];
    const meta = PARAM_LABELS[k];
    return (
      <ParamSlider key={k} id={k} label={meta.label} hint={meta.hint} fmt={meta.fmt} value={P[k]} min={spec.min} max={spec.max} step={spec.step} onChange={(v) => setParam(k, v, false)} onCommit={(v) => setParam(k, v, true)} />
    );
  };

  return (
    <div className="ss-noise flex min-h-[100dvh] flex-col bg-background text-foreground lg:h-[100dvh] lg:overflow-hidden">
      {/* top bar */}
      <header className="flex flex-wrap items-center gap-3 border-b border-foreground/15 px-4 py-2.5 lg:flex-nowrap">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-[4px] bg-foreground text-background">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M3 16c3-6 6 2 9-4s6-2 9-6" className="text-primary" stroke="hsl(var(--primary))" />
              <path d="M3 20c3-6 6 2 9-4s6-2 9-6" opacity=".6" />
              <path d="M3 12c3-6 6 2 9-4s6-2 9-6" opacity=".35" />
            </svg>
          </div>
          <div className="leading-none">
            <div className="text-[17px] font-extrabold tracking-tight">Style Scape</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">procedural studio / v2</div>
          </div>
        </div>
        <div className="mx-1 hidden h-6 w-px bg-border lg:block" />
        <input
          data-testid="input-scene-name"
          value={scene.name}
          onChange={(e) => preview({ ...scene, name: e.target.value.slice(0, 80) })}
          onBlur={() => commit(sceneRef.current)}
          className="min-w-0 flex-1 rounded-sm border border-transparent bg-transparent px-2 py-1 text-[15px] font-semibold tracking-tight outline-none transition-colors hover:border-border focus:border-foreground/40 focus:bg-card lg:max-w-xs"
          aria-label="Scene name"
        />
        <div className="ml-auto flex items-center gap-1">
          <button data-testid="button-cloud" onClick={() => setCloudOpen(true)} className="inline-flex items-center gap-1.5 rounded-sm border border-foreground/30 px-2.5 py-1.5 text-xs font-semibold transition-all hover:bg-foreground hover:text-background"><Cloud className="h-3.5 w-3.5" />Cloud</button>
          <IconBtn label="Undo (Ctrl+Z)" testid="button-undo" disabled={!h.past.length} onClick={() => dispatch({ t: "undo" })}><Undo2 className="h-4 w-4" /></IconBtn>
          <IconBtn label="Redo (Ctrl+Shift+Z)" testid="button-redo" disabled={!h.future.length} onClick={() => dispatch({ t: "redo" })}><Redo2 className="h-4 w-4" /></IconBtn>
          <span className="mx-1 hidden font-mono text-[10px] text-muted-foreground sm:inline">{h.past.length}/{h.future.length}</span>
          <IconBtn label="Import JSON" testid="button-import" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /></IconBtn>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" data-testid="input-import-file" onChange={(e) => onImport(e.target.files?.[0])} />
          <button data-testid="button-save" onClick={saveScene} className="ml-1 inline-flex items-center gap-1.5 rounded-sm border border-foreground/80 px-3 py-1.5 text-sm font-semibold transition-all hover:bg-foreground hover:text-background active:scale-[0.97]">
            <Save className="h-4 w-4" /> Save
          </button>
          <button data-testid="button-open-export" onClick={() => setExportOpen(true)} className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-[0_2px_0_hsl(var(--foreground))] transition-all hover:-translate-y-px active:translate-y-px active:shadow-none">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[248px_minmax(0,1fr)_320px]">
        {/* left */}
        <aside className="order-3 flex min-h-0 flex-col border-foreground/15 bg-sidebar lg:order-1 lg:border-r">
          <div className="flex border-b border-border p-1.5">
            {(["presets", "library"] as const).map((t) => (
              <button key={t} data-testid={`tab-${t}`} onClick={() => setLeftTab(t)} className={cn("flex-1 rounded-sm py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors", leftTab === t ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
                {t === "presets" ? "Scenes" : `Saved ${library.length}`}
              </button>
            ))}
          </div>
          <div className="ss-scroll min-h-0 flex-1 overflow-y-auto p-2">
            {leftTab === "presets" ? (
              <ul className="space-y-1">
                {PRESETS.map((p, i) => (
                  <li key={p.id} className="ss-rise" style={{ animationDelay: `${i * 40}ms` }}>
                    <button
                      data-testid={`button-preset-${p.id}`}
                      onClick={() => {
                        commit(structuredClone(p.scene));
                        setSavedId(null);
                      }}
                      className={cn("group w-full rounded-sm border px-3 py-2.5 text-left transition-all hover:border-foreground/30 hover:bg-card", scene.name === p.scene.name ? "border-foreground/50 bg-card" : "border-transparent")}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold tracking-tight">{p.scene.name}</span>
                        <span className="font-mono text-[9px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{p.blurb}</div>
                      <div className="mt-2"><Swatches colors={p.scene.palette.colors} background={p.scene.palette.background} /></div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : library.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-10 text-center">
                <FolderOpen className="mb-3 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm font-semibold">Nothing pinned yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Save a scene and it lives here, in this browser only. Ctrl+S works too.</p>
                <button onClick={saveScene} data-testid="button-save-empty" className="mt-4 rounded-sm bg-foreground px-3 py-1.5 text-xs font-semibold text-background active:scale-95">Save current scene</button>
              </div>
            ) : (
              <ul className="space-y-2">
                {library.map((it) => (
                  <li key={it.id} className={cn("group overflow-hidden rounded-sm border bg-card transition-colors", savedId === it.id ? "border-primary" : "border-border hover:border-foreground/30")}>
                    <button data-testid={`button-open-${it.id}`} className="block w-full text-left" onClick={() => { commit(structuredClone(it.scene)); setSavedId(it.id); }}>
                      {it.thumb ? <img src={it.thumb} alt="" className="aspect-[16/10] w-full object-cover" /> : <div className="aspect-[16/10] w-full" style={{ background: it.scene.palette.background }} />}
                      <div className="px-2.5 pt-2 text-[13px] font-semibold">{it.name}</div>
                    </button>
                    <div className="flex items-center justify-between px-2.5 pb-2">
                      <span className="font-mono text-[10px] text-muted-foreground">{new Date(it.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })} &middot; #{it.scene.seed}</span>
                      <button data-testid={`button-delete-${it.id}`} aria-label={`Delete ${it.name}`} onClick={() => deleteSaved(it.id)} className="rounded-sm p-1 text-muted-foreground opacity-60 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="hidden border-t border-border p-3 font-mono text-[10px] leading-relaxed text-muted-foreground lg:block">
            R reseed &middot; V variations &middot; E export<br />Ctrl+Z / Ctrl+Shift+Z &middot; Ctrl+S
          </div>
        </aside>

        {/* stage */}
        <main className="grid-paper order-1 flex min-h-0 flex-col gap-3 p-3 lg:order-2 lg:p-5">
          <div className="relative min-h-0 w-full max-h-[64dvh] overflow-hidden rounded-[6px] bg-foreground shadow-[0_0_0_1px_hsl(var(--foreground)),0_18px_40px_-18px_hsl(var(--foreground)/0.6)]" style={{ aspectRatio: frameRatio }}>
            <StageCanvas
              scene={scene}
              onStats={(s) => {
                setStats(s);
                if (s.fallbackReason && !reportedFallback.current) {
                  reportedFallback.current = true;
                  toast({ title: "Canvas2D fallback", description: "WebGL is unavailable; rendering with a simplified 2D path." });
                }
              }}
              onError={(m) => toast({ variant: "destructive", title: "Renderer", description: m })}
            />
            {contentGuides && <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/10">
              <div className="absolute inset-[9%] rounded border border-dashed border-white/45" />
              <div className="rounded bg-black/35 px-5 py-3 text-center text-white shadow-lg backdrop-blur-sm">
                <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-white/70">Website content preview</span>
                <span className="mt-1 block text-2xl font-semibold">Your story, in focus.</span>
                <span className="mt-1 block text-xs text-white/75">Quiet-zone overlay · excluded from exports</span>
              </div>
            </div>}
            <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded border border-white/15 bg-black/55 p-1 backdrop-blur">
              <label htmlFor="frame-ratio" className="sr-only">Preview aspect ratio</label>
              <select id="frame-ratio" aria-label="Preview aspect ratio" value={frameRatio} onChange={(e) => setFrameRatio(e.target.value)} className="rounded bg-transparent px-1.5 py-1 font-mono text-[10px] text-white outline-none">
                <option className="text-foreground" value="16 / 9">16:9</option><option className="text-foreground" value="4 / 3">4:3</option><option className="text-foreground" value="1 / 1">1:1</option><option className="text-foreground" value="9 / 16">9:16</option>
              </select>
              <button data-testid="toggle-content-guides" aria-pressed={contentGuides} onClick={() => setContentGuides((value) => !value)} className="rounded px-2 py-1 text-[10px] text-white hover:bg-white/15">{contentGuides ? "Hide text guide" : "Preview text space"}</button>
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
              <div className="pointer-events-auto flex items-center gap-1 rounded-sm bg-[hsl(232_36%_8%/0.72)] p-1 text-[hsl(40_30%_94%)] backdrop-blur">
                <button data-testid="button-seed-prev" aria-label="Previous seed" onClick={() => reseed(-1)} className="rounded-sm p-1.5 hover:bg-white/10"><ChevronLeft className="h-3.5 w-3.5" /></button>
                <label className="font-mono text-[11px] uppercase tracking-wider text-white/50">seed</label>
                <input
                  data-testid="input-seed"
                  value={scene.seed}
                  inputMode="numeric"
                  onChange={(e) => {
                    const n = Number(e.target.value.replace(/\D/g, "").slice(0, 9));
                    preview({ ...scene, seed: n });
                  }}
                  onBlur={() => commit(sceneRef.current)}
                  className="w-20 bg-transparent px-1 font-mono text-[13px] tabular-nums outline-none"
                />
                <button data-testid="button-seed-next" aria-label="Next seed" onClick={() => reseed(1)} className="rounded-sm p-1.5 hover:bg-white/10"><ChevronRight className="h-3.5 w-3.5" /></button>
                <button data-testid="button-reseed" onClick={() => reseed()} className="ml-1 inline-flex items-center gap-1 rounded-sm bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground active:scale-95">
                  <Dices className="h-3.5 w-3.5" /> Roll
                </button>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 p-3 font-mono text-[10px] uppercase tracking-wider text-[hsl(40_30%_94%)]">
              {stats ? (
                <>
                  <Chip><Cpu className="mr-1 inline h-3 w-3" />{stats.renderer}</Chip>
                  <Chip data-testid="text-ribbons">{stats.ribbons} ribbons</Chip>
                  <Chip>{(stats.vertices / 1000).toFixed(1)}k verts</Chip>
                  <Chip>{stats.buildMs} ms build</Chip>
                  <Chip>{stats.width}x{stats.height}</Chip>
                  {!stats.animated && <Chip>static</Chip>}
                </>
              ) : (
                <Chip>initialising</Chip>
              )}
            </div>
          </div>

          {/* variations */}
          <div className="rounded-[6px] border border-foreground/15 bg-card/90 p-3 backdrop-blur">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <button data-testid="button-generate-variations" onClick={generate} disabled={generating} className="inline-flex items-center gap-1.5 rounded-sm bg-foreground px-3 py-1.5 text-sm font-semibold text-background transition-all hover:bg-foreground/90 active:scale-[0.97] disabled:opacity-60">
                <Shuffle className="h-4 w-4" /> {generating ? "Sampling..." : "Generate variations"}
              </button>
              <div className="flex w-40 items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Range</span>
                <input data-testid="input-variation-amount" type="range" min={0.05} max={1} step={0.05} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" aria-label="Variation range" />
                <span className="w-8 font-mono text-[10px] tabular-nums">{Math.round(amount * 100)}%</span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Lock</span>
                {(["seed", ...LOCK_GROUPS.map((g) => g.id)] as LockGroup[]).map((g) => (
                  <button key={g} data-testid={`toggle-lock-${g}`} onClick={() => toggleLock(g)} aria-pressed={locks.has(g)} className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize transition-all active:scale-95", locks.has(g) ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground")}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            {vars.length > 0 ? (
              <div className="ss-scroll mt-3 grid grid-flow-col auto-cols-[minmax(130px,1fr)] gap-2 overflow-x-auto pb-1">
                {vars.map((v, i) => (
                  <button key={i} data-testid={`button-variation-${i}`} disabled={!v.thumb} onClick={() => commit(v.scene)} className="ss-rise group relative overflow-hidden rounded-sm text-left ring-1 ring-foreground/15 transition-all hover:-translate-y-0.5 hover:ring-2 hover:ring-primary" style={{ animationDelay: `${i * 50}ms` }}>
                    {v.thumb ? <img src={v.thumb} alt={v.scene.name} className="aspect-[16/10] w-full object-cover" /> : <div className="aspect-[16/10] w-full animate-pulse" style={{ background: v.scene.palette.background }} />}
                    <span className="absolute bottom-1 left-1 rounded-sm bg-[hsl(232_36%_8%/0.7)] px-1.5 py-0.5 font-mono text-[9px] text-white/90">#{v.scene.seed}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-primary" /> Six siblings of the current scene, sampled around its parameters. Locked groups stay fixed.</p>
            )}
          </div>
        </main>

        {/* inspector */}
        <aside className="ss-scroll order-2 min-h-0 overflow-y-auto border-foreground/15 bg-card lg:order-3 lg:border-l">
          <Section title="Vector field" index="00" locked={locks.has("field")} onToggleLock={() => toggleLock("field")}>
            <p className="mb-2 text-[11px] text-muted-foreground">Pick the equation that moves the seeded ribbon paths.</p>
            <div role="group" aria-label="Vector field mode" className="grid grid-cols-3 gap-1">
              {([
                ["curl", "Curl", "Warped noise field"],
                ["orbit", "Vortices", "Four interacting sinks"],
                ["contour", "Isolines", "Follow noise contours"],
              ] as const).map(([mode, label, hint]) => (
                <button
                  key={mode}
                  data-testid={`button-field-${mode}`}
                  aria-pressed={scene.fieldMode === mode}
                  title={hint}
                  onClick={() => commit({ ...scene, fieldMode: mode })}
                  className={cn("rounded-sm border px-1.5 py-2 text-center transition-colors", scene.fieldMode === mode ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:border-foreground/40")}
                >
                  <span className="block text-[11px] font-semibold">{label}</span>
                  <span className="mt-0.5 block text-[9px]">{hint}</span>
                </button>
              ))}
            </div>
          </Section>
          {SECTIONS.slice(0, 2).map((sec) => (
            <Section key={sec.group} title={sec.title} index={sec.idx} locked={locks.has(sec.group)} onToggleLock={() => toggleLock(sec.group)}>
              {LOCK_GROUPS.find((g) => g.id === sec.group)!.keys.map(slider)}
            </Section>
          ))}
          <Section title="Color" index="03" locked={locks.has("color")} onToggleLock={() => toggleLock("color")}>
            <div className="mb-3 grid grid-cols-2 gap-1.5">
              {PALETTES.map((p) => {
                const active = p.background === scene.palette.background && p.colors.join() === scene.palette.colors.join();
                return (
                  <button key={p.id} data-testid={`button-palette-${p.id}`} onClick={() => commit({ ...scene, palette: { background: p.background, colors: [...p.colors] } })} className={cn("rounded-sm border p-1.5 text-left transition-all active:scale-[0.97]", active ? "border-foreground bg-muted" : "border-border hover:border-foreground/40")}>
                    <Swatches colors={p.colors} background={p.background} />
                    <span className="mt-1 block text-[11px] font-medium">{p.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="mb-3 flex items-center gap-1.5">
              <ColorInput testid="color-background" label="Background" value={scene.palette.background} onPreview={(c) => preview({ ...sceneRef.current, palette: { ...sceneRef.current.palette, background: c } })} onCommit={() => commit(sceneRef.current)} wide />
              {scene.palette.colors.map((c, i) => (
                <ColorInput key={i} testid={`color-${i}`} label={`Ink ${i + 1}`} value={c} onPreview={(v) => { const cs = [...sceneRef.current.palette.colors]; cs[i] = v; preview({ ...sceneRef.current, palette: { ...sceneRef.current.palette, colors: cs } }); }} onCommit={() => commit(sceneRef.current)} />
              ))}
            </div>
            <div className="mb-2 flex rounded-sm border border-border p-0.5">
              {BLEND_MODES.map((b) => (
                <button key={b} data-testid={`button-blend-${b}`} onClick={() => commit({ ...scene, blend: b })} className={cn("flex-1 rounded-[3px] py-1 text-[11px] font-semibold capitalize transition-colors", scene.blend === b ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
                  {b}
                </button>
              ))}
            </div>
            {slider("colorSpread")}
          </Section>
          {SECTIONS.slice(2).map((sec) => (
            <Section key={sec.group} title={sec.title} index={sec.idx} locked={locks.has(sec.group)} onToggleLock={() => toggleLock(sec.group)}>
              {LOCK_GROUPS.find((g) => g.id === sec.group)!.keys.map(slider)}
              {sec.group === "motion" && <p className="mt-1 text-[11px] text-muted-foreground">Animation pauses in hidden tabs and is disabled when the OS requests reduced motion. Set drift to 0 for a static render.</p>}
            </Section>
          ))}
          <Section title="Vector layers" index="06">
            <LayerStack layers={scene.layers} palette={scene.palette} onChange={(layers) => commit({ ...scene, layers })} onPreview={(layers) => preview({ ...scene, layers })} />
          </Section>
        </aside>
      </div>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} scene={scene} />
      <CloudLibrary
        open={cloudOpen}
        onClose={() => setCloudOpen(false)}
        scene={scene}
        selected={cloudSelected}
        onSelected={setCloudSelected}
        onOpenScene={(next, id, revision) => { commit(next); setCloudSelected({ id, revision }); }}
      />
    </div>
  );
}

function IconBtn({ children, label, onClick, disabled, testid }: { children: ReactNode; label: string; onClick: () => void; disabled?: boolean; testid: string }) {
  return (
    <button data-testid={testid} title={label} aria-label={label} disabled={disabled} onClick={onClick} className="grid h-8 w-8 place-items-center rounded-sm text-foreground/80 transition-all hover:bg-muted hover:text-foreground active:scale-90 disabled:pointer-events-none disabled:opacity-30">
      {children}
    </button>
  );
}

function Chip({ children, ...rest }: { children: ReactNode; "data-testid"?: string }) {
  return <span {...rest} className="rounded-sm bg-[hsl(232_36%_8%/0.66)] px-1.5 py-0.5 backdrop-blur">{children}</span>;
}

function ColorInput({ value, label, onPreview, onCommit, wide, testid }: { value: string; label: string; onPreview: (c: string) => void; onCommit: () => void; wide?: boolean; testid: string }) {
  return (
    <label title={`${label} ${value}`} className={cn("relative block h-8 cursor-pointer overflow-hidden rounded-sm ring-1 ring-foreground/20 transition-transform hover:-translate-y-0.5", wide ? "w-12" : "flex-1")} style={{ background: value }}>
      <input data-testid={testid} type="color" value={value} onChange={(e) => onPreview(e.target.value)} onBlur={onCommit} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label={label} />
    </label>
  );
}
