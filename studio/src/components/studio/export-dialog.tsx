import { useMemo, useRef, useState } from "react";
import { Check, Copy, Download, FileCode2, FileJson, Image as ImageIcon, Globe, Film, Video, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { angularComponent, dataURLToBlob, download, reactComponent, runtimeSource, sceneJSON, slug, standaloneHTML, vectorSvg, vueComponent } from "@/lib/exporters";
import { createStyleScape, LIMITS, RUNTIME_VERSION, renderToDataURL, type Scene, type StyleScapeInstance } from "@/runtime/stylescape-runtime.js";

type Tab = "png" | "json" | "html" | "svg" | "react" | "vue" | "angular" | "video";
const SIZES = [
  { id: "hd", label: "1920 x 1080", w: 1920, h: 1080 },
  { id: "qhd", label: "2560 x 1440", w: 2560, h: 1440 },
  { id: "4k", label: "3840 x 2160", w: 3840, h: 2160 },
  { id: "sq", label: "2048 x 2048", w: 2048, h: 2048 },
  { id: "story", label: "1080 x 1920", w: 1080, h: 1920 },
];

export function ExportDialog({ open, onOpenChange, scene }: { open: boolean; onOpenChange: (o: boolean) => void; scene: Scene }) {
  const [tab, setTab] = useState<Tab>("png");
  const [size, setSize] = useState("hd");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const cancelRecording = useRef<(() => void) | null>(null);
  const { toast } = useToast();
  const name = slug(scene.name);

  const code = useMemo(() => {
    if (!open) return "";
    if (tab === "json") return sceneJSON(scene);
    if (tab === "html") return standaloneHTML(scene);
    if (tab === "svg") return vectorSvg(scene);
    if (tab === "react") return reactComponent(scene);
    if (tab === "vue") return vueComponent(scene);
    if (tab === "angular") return angularComponent(scene);
    return "";
  }, [tab, scene, open]);

  const fail = (what: string, e: unknown) =>
    toast({ variant: "destructive", title: `${what} failed`, description: e instanceof Error ? e.message : String(e) });

  async function exportPNG() {
    const s = SIZES.find((x) => x.id === size) ?? SIZES[0];
    setBusy(true);
    await new Promise((r) => setTimeout(r, 30));
    try {
      const url = renderToDataURL(scene, s.w, s.h);
      if (!url.startsWith("data:image/png")) throw new Error("Browser could not encode PNG.");
      download(`${name}-${s.w}x${s.h}.png`, await dataURLToBlob(url));
      toast({ title: "PNG exported", description: `${s.w} x ${s.h}, seed ${scene.seed}` });
    } catch (e) {
      fail("PNG export", e);
    } finally {
      setBusy(false);
    }
  }

  async function recordVideo() {
    if (!("MediaRecorder" in window) || !HTMLCanvasElement.prototype.captureStream) {
      fail("WebM export", new Error("This browser does not support canvas recording."));
      return;
    }
    if (recording) return;
    let renderer: StyleScapeInstance | null = null;
    let media: MediaRecorder | null = null;
    let stream: MediaStream | null = null;
    let timer = 0;
    let chunks: Blob[] = [];
    let shouldDownload = true;
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const close = () => {
      window.clearInterval(timer);
      if (media && media.state !== "inactive") media.stop();
      renderer?.dispose();
      renderer = null;
      stream?.getTracks().forEach((track) => track.stop());
      cancelRecording.current = null;
      setRecording(false);
    };
    cancelRecording.current = () => { shouldDownload = false; close(); };
    try {
      stream = canvas.captureStream(30);
      const mime = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((type) => MediaRecorder.isTypeSupported(type));
      if (!mime) throw new Error("This browser has no supported WebM encoder.");
      renderer = createStyleScape(canvas, scene, { animate: true, maxDpr: 1, width: 1280, height: 720, renderer: scene.layers?.length ? "canvas2d" : "auto" });
      media = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
      media.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      media.onstop = () => {
        if (shouldDownload && chunks.length) {
          download(`${name}-6s-1280x720.webm`, new Blob(chunks, { type: mime }));
          toast({ title: "Animation exported", description: "6 seconds · 1280 × 720 · WebM" });
        }
        chunks = [];
      };
      media.onerror = () => {
        shouldDownload = false;
        fail("WebM export", new Error("The browser stopped recording unexpectedly."));
        close();
      };
      setRecording(true);
      setRecordTime(0);
      timer = window.setInterval(() => setRecordTime((previous) => {
        if (previous >= 5) { close(); return 6; }
        return previous + 1;
      }), 1000);
      media.start(200);
    } catch (error) {
      shouldDownload = false;
      close();
      fail("WebM export", error);
    }
  }

  function save() {
    try {
      if (tab === "json") download(`${name}.stylescape.json`, code, "application/json");
      if (tab === "html") download(`${name}.html`, code, "text/html");
      if (tab === "svg") download(`${name}.svg`, code, "image/svg+xml;charset=utf-8");
      if (tab === "react") download("StyleScape.jsx", code, "text/javascript");
      if (tab === "vue") download("StyleScape.vue", code, "text/javascript");
      if (tab === "angular") download("stylescape.component.ts", code, "text/javascript");
      toast({ title: "Download started" });
    } catch (e) {
      fail("Download", e);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (e) {
      fail("Copy", e);
    }
  }

  const tabs: { id: Tab; label: string; icon: typeof ImageIcon; note: string }[] = [
    { id: "png", label: "PNG", icon: ImageIcon, note: "Raster, rendered offscreen" },
    { id: "json", label: "Scene JSON", icon: FileJson, note: "Re-importable source of truth" },
    { id: "html", label: "Standalone HTML", icon: Globe, note: "Single file, runtime inlined" },
    { id: "svg", label: "Editable SVG", icon: FileCode2, note: "Vector field and design layers" },
    { id: "react", label: "React embed", icon: FileCode2, note: "Component + runtime module" },
    { id: "vue", label: "Vue 3", icon: FileCode2, note: "Single-file component + runtime" },
    { id: "angular", label: "Angular", icon: FileCode2, note: "Standalone component + runtime" },
    { id: "video", label: "WebM", icon: Film, note: "Record a six-second animated preview" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden border-foreground/20 bg-card p-0 sm:rounded-md">
        <DialogHeader className="border-b border-border px-6 py-5 text-left">
          <DialogTitle className="text-2xl font-bold tracking-tight">Export "{scene.name}"</DialogTitle>
          <DialogDescription className="font-mono text-[11px] uppercase tracking-wider">
            Runtime {RUNTIME_VERSION} &middot; seed {scene.seed} &middot; every format renders with the same engine
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-[200px_1fr]">
          <nav className="flex gap-1 overflow-x-auto border-b border-border p-2 md:flex-col md:border-b-0 md:border-r">
            {tabs.map((t) => (
              <button
                key={t.id}
                data-testid={`tab-export-${t.id}`}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex shrink-0 items-start gap-2.5 rounded-sm px-3 py-2.5 text-left transition-colors",
                  tab === t.id ? "bg-foreground text-background" : "hover:bg-muted",
                )}
              >
                <t.icon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">{t.label}</span>
                  <span className={cn("hidden text-[11px] md:block", tab === t.id ? "text-background/60" : "text-muted-foreground")}>{t.note}</span>
                </span>
              </button>
            ))}
          </nav>
          <div className="min-w-0 p-5">
            {tab === "video" ? (
              <div className="space-y-4">
                <p className="text-sm">Record the live scene through this browser&apos;s canvas encoder. Your device renders the animation locally; no video service is used.</p>
                <p className="text-xs text-muted-foreground">Six seconds · 1280 × 720 · 30 fps · WebM. Browser encoding and performance vary by device. Layered scenes use the Canvas 2D renderer for capture.</p>
                {recording ? (
                  <div className="flex items-center gap-3">
                    <div role="progressbar" aria-label="Recording" aria-valuenow={recordTime} aria-valuemin={0} aria-valuemax={6} className="h-2 flex-1 overflow-hidden rounded bg-muted"><div className="h-full bg-primary transition-[width]" style={{ width: `${Math.min(100, recordTime / 6 * 100)}%` }} /></div>
                    <span className="font-mono text-xs">{recordTime}/6s</span>
                    <button onClick={() => cancelRecording.current?.()} className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-xs"><X className="h-3.5 w-3.5" />Cancel</button>
                  </div>
                ) : <button onClick={() => void recordVideo()} className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Video className="h-4 w-4" />Record WebM</button>}
              </div>
            ) : tab === "png" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SIZES.map((s) => (
                    <button
                      key={s.id}
                      data-testid={`button-size-${s.id}`}
                      onClick={() => setSize(s.id)}
                      className={cn(
                        "rounded-sm border px-3 py-3 text-left font-mono text-xs transition-all active:scale-[0.98]",
                        size === s.id ? "border-primary bg-primary/10 text-foreground" : "border-border hover:border-foreground/40",
                      )}
                    >
                      <span className="mb-2 flex h-8 items-center">
                        <span className="block border border-current/40 bg-foreground/10" style={{ width: (s.w / Math.max(s.w, s.h)) * 32, height: (s.h / Math.max(s.w, s.h)) * 32 }} />
                      </span>
                      {s.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Rendered in a fresh offscreen context, capped at {LIMITS.maxCanvasEdge}px per edge. Geometry is regenerated for the export aspect ratio, so non-matching ratios reveal more or less of the field. Animation is frozen at t = 0.
                </p>
                <button
                  data-testid="button-export-png"
                  disabled={busy}
                  onClick={exportPNG}
                  className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  {busy ? "Rendering..." : "Render PNG"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <pre data-testid="text-export-code" className="ss-scroll max-h-[340px] overflow-auto rounded-sm bg-foreground p-4 font-mono text-[11px] leading-relaxed text-background/85">
                  {code.length > 14000 ? code.slice(0, 14000) + "\n/* ... preview truncated, download for full file ... */" : code}
                </pre>
                <div className="flex flex-wrap gap-2">
                  <button data-testid="button-download-export" onClick={save} className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]">
                    <Download className="h-4 w-4" />
                      Download {tab === "json" ? ".json" : tab === "html" ? ".html" : tab === "svg" ? `${name}.svg` : tab === "vue" ? "StyleScape.vue" : tab === "angular" ? "stylescape.component.ts" : "StyleScape.jsx"}
                  </button>
                  {(tab === "react" || tab === "vue" || tab === "angular") && (
                    <button
                      data-testid="button-download-runtime"
                      onClick={() => download("stylescape-runtime.js", runtimeSource, "text/javascript")}
                      className="inline-flex items-center gap-2 rounded-sm border border-foreground px-4 py-2 text-sm font-semibold transition-all hover:bg-foreground hover:text-background active:scale-[0.98]"
                    >
                      <Download className="h-4 w-4" />
                      stylescape-runtime.js
                    </button>
                  )}
                  <button data-testid="button-copy-export" onClick={copy} className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm font-medium transition-all hover:border-foreground/50 active:scale-[0.98]">
                    {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {tab === "json" && "Import this file back into the studio from the top bar. Values are validated and clamped on import."}
                  {tab === "html" && "Opens offline in any modern browser. WebGL with Canvas2D fallback, pauses in hidden tabs, honours reduced motion."}
                  {tab === "svg" && "Real editable vector paths for the flow ribbons and your ordered vector layers. GPU-only interference, grain, and vignette shading are omitted; use PNG for a pixel-matched render."}
                  {tab === "react" && "Requires React. Download stylescape-runtime.js beside the component; both use the same renderer as the studio."}
                  {tab === "vue" && "Requires Vue 3. Download stylescape-runtime.js beside the single-file component."}
                  {tab === "angular" && "Requires Angular. Import the standalone component into your app and download its runtime alongside it."}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
