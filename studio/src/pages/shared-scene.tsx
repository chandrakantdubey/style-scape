import { useEffect, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { useGetPublishedScene } from "@workspace/api-client-react";
import { createStyleScape, validateScene, type Scene, type StyleScapeInstance } from "@/runtime/stylescape-runtime.js";
import { download } from "@/lib/exporters";

export default function SharedScene() {
  const [, params] = useRoute("/shared/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ?? "";
  const result = useGetPublishedScene(id, { query: { enabled: Boolean(id), retry: false } });
  const canvas = useRef<HTMLCanvasElement>(null);
  const instance = useRef<StyleScapeInstance | null>(null);
  const validated = result.data ? validateScene(result.data.scene) : null;
  const scene = validated?.ok ? validated.scene : null;

  useEffect(() => {
    if (!canvas.current || !scene) return;
    try {
      const view = createStyleScape(canvas.current, scene, { animate: true, maxDpr: 1.5 });
      instance.current = view;
      return () => { view.dispose(); instance.current = null; };
    } catch { return; }
  }, [scene]);

  function useScene() {
    if (!scene) return;
    sessionStorage.setItem("stylescape.v2.shared-import", JSON.stringify(scene));
    setLocation("/");
  }
  function saveSnapshot() {
    if (!scene || !result.data) return;
    download(`${result.data.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.stylescape.json`, JSON.stringify(scene, null, 2), "application/json");
  }

  if (result.isLoading) return <main className="grid min-h-[100dvh] place-items-center bg-background">Loading shared scene…</main>;
  if (result.isError || !result.data || !scene) return <main className="grid min-h-[100dvh] place-items-center bg-background px-5"><div className="max-w-md space-y-3 text-center"><p className="font-mono text-xs uppercase tracking-widest">Style Scape · shared scene</p><h1 className="text-2xl font-semibold">This scene is unavailable</h1><p className="text-sm text-muted-foreground">Its owner may have revoked the link, or this saved scene is no longer compatible.</p><button onClick={() => setLocation("/")} className="rounded bg-foreground px-4 py-2 text-background">Open the studio</button></div></main>;

  return (
    <main className="ss-noise grid min-h-[100dvh] place-items-center bg-background p-5">
      <article className="w-full max-w-6xl space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Style Scape · read-only snapshot · revision {result.data.revision}</p><h1 className="mt-1 text-3xl font-bold">{result.data.title}</h1><p className="mt-1 text-xs text-muted-foreground">Published scenes are independent snapshots. The owner's private project is not exposed.</p></div>
          <div className="flex gap-2"><button onClick={saveSnapshot} className="rounded border px-3 py-2 text-sm">Download scene JSON</button><button onClick={useScene} className="rounded bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Use in my studio</button></div>
        </header>
        <div className="overflow-hidden rounded-md border border-foreground/15 bg-[#0e1220] shadow-xl"><canvas ref={canvas} aria-label={`Animated procedural background: ${result.data.title}`} className="block max-h-[76dvh] w-full object-contain" /></div>
        {instance.current?.renderer === "canvas2d" && <p className="text-xs text-muted-foreground">This browser is using the simplified static fallback.</p>}
      </article>
    </main>
  );
}
