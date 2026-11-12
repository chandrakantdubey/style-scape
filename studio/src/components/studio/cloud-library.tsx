import { useMemo, useState } from "react";
import { useAuth, useClerk } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, Cloud, ExternalLink, History, Link2, LoaderCircle, Trash2, UploadCloud } from "lucide-react";
import {
  getListProjectsQueryKey, getListRevisionsQueryKey,
  useCreateProject, useDeleteProject, useListProjects, useListRevisions,
  usePublishProject, useUnpublishProject, useUpdateProject,
} from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { validateScene, type Scene } from "@/runtime/stylescape-runtime.js";

type Project = { id: string; title: string; scene: Record<string, unknown>; revision: number; updatedAt: string; publishedId: string | null };
type Props = { open: boolean; onClose: () => void; scene: Scene; onOpenScene: (scene: Scene, id: string, revision: number) => void; selected: { id: string; revision: number } | null; onSelected: (value: { id: string; revision: number } | null) => void };

export function CloudLibrary({ open, onClose, scene, onOpenScene, selected, onSelected }: Props) {
  const { isSignedIn, isLoaded } = useAuth();
  const { openSignIn } = useClerk();
  const client = useQueryClient();
  const { toast } = useToast();
  const projects = useListProjects({ query: { enabled: Boolean(isSignedIn && open) } });
  const revisions = useListRevisions(selected?.id ?? "", { query: { enabled: Boolean(selected && open) } });
  const create = useCreateProject();
  const update = useUpdateProject();
  const remove = useDeleteProject();
  const publish = usePublishProject();
  const unpublish = useUnpublishProject();
  const [title, setTitle] = useState(scene.name);
  const [busy, setBusy] = useState(false);
  const [conflict, setConflict] = useState<Project | null>(null);
  const rows = (projects.data ?? []) as Project[];
  const active = rows.find((p) => p.id === selected?.id) ?? null;
  const isDirty = useMemo(() => !active || JSON.stringify(active.scene) !== JSON.stringify(scene) || active.title !== title, [active, scene, title]);

  function fail(error: unknown, label: string) {
    const message = error instanceof Error ? error.message : String(error);
    toast({ variant: "destructive", title: label, description: message.includes("409") ? "This project changed in another session. Reload it to resolve the conflict." : message });
  }
  async function refresh() {
    await client.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    if (selected) await client.invalidateQueries({ queryKey: getListRevisionsQueryKey(selected.id) });
  }
  function openProject(project: Project) {
    if (isDirty && active && !window.confirm("Your current scene has unsaved cloud changes. Open another project anyway? Your current scene remains in this browser.")) return;
    const parsed = validateScene(project.scene);
    if (!parsed.ok) { toast({ variant: "destructive", title: "Cannot open scene", description: parsed.errors[0] }); return; }
    setTitle(project.title);
    onSelected({ id: project.id, revision: project.revision });
    onOpenScene(parsed.scene, project.id, project.revision);
  }
  async function saveProject() {
    if (!isSignedIn || busy) return;
    setBusy(true); setConflict(null);
    try {
      if (selected && active) {
        const saved = await update.mutateAsync({ id: active.id, data: { title: title.trim() || scene.name, scene: scene as unknown as Record<string, unknown>, expectedRevision: selected.revision } });
        onSelected({ id: saved.id, revision: saved.revision });
        toast({ title: "Cloud project saved", description: `Revision ${saved.revision} is now private to your account.` });
      } else {
        const saved = await create.mutateAsync({ data: { title: title.trim() || scene.name, scene: scene as unknown as Record<string, unknown> } });
        onSelected({ id: saved.id, revision: saved.revision });
        toast({ title: "Cloud project created", description: "This scene now has a private cloud copy." });
      }
      await refresh();
    } catch (e) {
      const anyError = e as { status?: number };
      if (anyError.status === 409) {
        await refresh();
        const latest = ((await client.fetchQuery({ queryKey: getListProjectsQueryKey(), queryFn: async () => (await fetch("/api/projects", { credentials: "include" })).json() })) as Project[]).find((p) => p.id === selected?.id);
        if (latest) setConflict(latest);
      }
      fail(e, "Cloud save failed");
    } finally { setBusy(false); }
  }
  async function deleteProject(project: Project) {
    if (!window.confirm(`Delete “${project.title}” and its saved revision history? This cannot be undone.`)) return;
    try {
      await remove.mutateAsync({ id: project.id });
      if (selected?.id === project.id) onSelected(null);
      await client.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      toast({ title: "Project deleted", description: "The cloud project and its history were removed." });
    } catch (e) { fail(e, "Delete failed"); }
  }
  async function togglePublish() {
    if (!active || busy) return;
    setBusy(true);
    try {
      let project = active;
      if (isDirty) {
        project = await update.mutateAsync({ id: active.id, data: { title: title.trim() || scene.name, scene: scene as unknown as Record<string, unknown>, expectedRevision: selected!.revision } }) as Project;
        onSelected({ id: project.id, revision: project.revision });
      }
      if (project.publishedId) {
        if (!window.confirm("Turn off public access? Its current share link will stop working.")) return;
        await unpublish.mutateAsync({ id: project.id });
        toast({ title: "Public link revoked" });
      } else {
        if (!window.confirm("Publish a read-only snapshot of this scene? Anyone with the link can view it.")) return;
        const published = await publish.mutateAsync({ id: project.id });
        if (published.publishedId) {
          await navigator.clipboard.writeText(`${location.origin}${import.meta.env.BASE_URL}shared/${published.publishedId}`);
          toast({ title: "Read-only scene published", description: "The private editor and project history remain private. Link copied." });
        }
      }
      await refresh();
    } catch (e) { fail(e, "Sharing failed"); } finally { setBusy(false); }
  }
  async function copyLink(id: string) {
    try { await navigator.clipboard.writeText(`${location.origin}${import.meta.env.BASE_URL}shared/${id}`); toast({ title: "Share link copied" }); }
    catch { toast({ variant: "destructive", title: "Could not copy link", description: "Copy the share URL from your browser address bar." }); }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <DialogContent className="max-h-[88dvh] max-w-3xl overflow-y-auto border-foreground/20 bg-card p-0">
        <DialogHeader className="border-b border-border px-6 py-5 text-left">
          <DialogTitle className="flex items-center gap-2 text-2xl"><Cloud className="h-5 w-5 text-primary" /> Cloud projects</DialogTitle>
          <DialogDescription>Browser saves stay on this device. Cloud projects are private to your account until you publish a separate, read-only scene snapshot.</DialogDescription>
        </DialogHeader>
        {!isLoaded ? <div className="p-8">Loading account…</div> : !isSignedIn ? (
          <div className="space-y-4 p-7">
            <p className="text-sm">Your studio stays usable without signing in. Sign in only to save projects across devices and manage share links.</p>
            <button className="rounded bg-foreground px-4 py-2 text-background" onClick={() => openSignIn({ forceRedirectUrl: location.href })}>Sign in to cloud projects</button>
          </div>
        ) : (
          <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.85fr)]">
            <section className="min-w-0">
              <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Your private projects</h3><button aria-label="Refresh cloud projects" className="text-xs underline" onClick={() => void projects.refetch()}>Refresh</button></div>
              {projects.isLoading ? <p className="text-sm text-muted-foreground">Loading projects…</p> : projects.isError ? <p role="alert" className="text-sm text-destructive">Cloud projects could not load. Check your connection and refresh.</p> : rows.length === 0 ? <p className="rounded border border-dashed p-4 text-sm text-muted-foreground">No cloud projects yet. Save this scene to start your private library.</p> : (
                <ul className="max-h-[47vh] space-y-2 overflow-y-auto pr-1">
                  {rows.map((project) => (
                    <li key={project.id} className={`rounded border p-3 ${selected?.id === project.id ? "border-primary" : "border-border"}`}>
                      <div className="flex items-start gap-2">
                        <button className="min-w-0 flex-1 text-left" onClick={() => openProject(project)}>
                          <span className="block truncate text-sm font-semibold">{project.title}</span>
                          <span className="mt-1 block font-mono text-[10px] text-muted-foreground">Revision {project.revision} · {new Date(project.updatedAt).toLocaleString()}</span>
                        </button>
                        {project.publishedId && <button aria-label="Copy public link" className="rounded p-1 hover:bg-muted" title="Copy current read-only link" onClick={() => void copyLink(project.publishedId!)}><Copy className="h-4 w-4" /></button>}
                        <button aria-label={`Delete ${project.title}`} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => void deleteProject(project)}><Trash2 className="h-4 w-4" /></button>
                      </div>
                      {project.publishedId && <p className="mt-1 text-[10px] text-primary">Public read-only snapshot · revision link is revocable</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="min-w-0 space-y-3 border-t pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
              <h3 className="font-semibold">{active ? "Selected cloud project" : "Save current scene"}</h3>
              <label className="block text-xs font-medium">Project title<input maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 w-full rounded border border-input bg-background px-3 py-2 text-sm" /></label>
              {active && <p className="text-[11px] text-muted-foreground">{isDirty ? "Current scene differs from the saved cloud revision." : "Cloud revision matches the current scene."}</p>}
              <button disabled={busy || !title.trim()} onClick={() => void saveProject()} className="flex w-full items-center justify-center gap-2 rounded bg-foreground px-3 py-2 text-sm font-semibold text-background disabled:opacity-50">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}{active ? "Save new revision" : "Save as cloud project"}</button>
              {active && <div className="flex gap-2"><button onClick={() => onSelected(null)} className="flex-1 rounded border px-3 py-2 text-xs">Save as new project</button><button disabled={busy} onClick={() => void togglePublish()} className="flex flex-1 items-center justify-center gap-1 rounded border px-2 py-2 text-xs disabled:opacity-50">{active.publishedId ? <Link2 className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}{active.publishedId ? "Revoke public link" : "Publish read-only"}</button></div>}
              {active?.publishedId && <button onClick={() => void copyLink(active.publishedId!)} className="w-full rounded border border-primary/50 px-3 py-2 text-xs text-primary">Copy public snapshot link</button>}
              {conflict && <div role="alert" className="space-y-2 rounded border border-destructive/50 bg-destructive/5 p-3 text-xs"><p>The cloud version is now revision {conflict.revision}. Your current local scene is still intact.</p><button onClick={() => openProject(conflict)} className="rounded bg-foreground px-3 py-1.5 text-background">Load cloud revision</button></div>}
              {active && <details className="rounded border p-3"><summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold"><History className="h-4 w-4" /> Revision history ({revisions.data?.length ?? 0})</summary>
                {revisions.isError ? <p className="mt-2 text-xs text-destructive">History failed to load.</p> : <ul className="mt-2 max-h-44 space-y-1 overflow-y-auto">{(revisions.data ?? []).map((r) => (
                  <li key={r.revision} className="flex items-center justify-between gap-2 text-xs"><span>r{r.revision} · {new Date(r.createdAt).toLocaleString()}</span><button className="shrink-0 underline" onClick={() => { const parsed = validateScene(r.scene); if (!parsed.ok) { toast({ variant: "destructive", title: "Revision invalid", description: parsed.errors[0] }); return; } openProject({ ...active, title: r.title, scene: r.scene, revision: active.revision }); }}>Load</button></li>
                ))}</ul>}
              </details>}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
