import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { rateLimit } from "express-rate-limit";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import { db, projects, revisions, publications } from "@workspace/db";
import { CreateProjectBody, UpdateProjectBody, CreateProjectResponse, ListProjectsResponse,
  UpdateProjectResponse, ListRevisionsResponse, GetPublishedSceneResponse } from "@workspace/api-zod";
import { validDocument } from "../lib/project-document";

const router: IRouter = Router();
const limit = rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-7", legacyHeaders: false });
const view = (p: typeof projects.$inferSelect) => ({
  id: p.id, title: p.title, scene: p.scene, revision: p.revision,
  publishedId: p.publishedId, updatedAt: p.updatedAt.toISOString(),
});

router.get("/published/:id", limit, async (req, res) => {
  const [p] = await db.select().from(publications).where(eq(publications.id, String(req.params.id))).limit(1);
  if (!p) { res.status(404).json({ error: "This shared scene is unavailable." }); return; }
  // Avoid caches retaining scenes after their owner revokes publication.
  res.set("Cache-Control", "no-store");
  res.json(GetPublishedSceneResponse.parse(p));
});

router.use("/projects", limit, (req, res, next) => {
  if (!getAuth(req).userId) { res.status(401).json({ error: "Sign in to access cloud projects." }); return; }
  res.set("Cache-Control", "no-store");
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    if (req.get("sec-fetch-site") === "cross-site") { res.status(403).json({ error: "Cross-site write denied." }); return; }
    const origin = req.get("origin");
    const host = (req.get("x-forwarded-host") || req.get("host") || "").split(",")[0]?.trim();
    if (origin && new URL(origin).host !== host) { res.status(403).json({ error: "Origin mismatch." }); return; }
  }
  next();
});

router.get("/projects", async (req, res) => {
  const rows = await db.select().from(projects).where(eq(projects.ownerId, getAuth(req).userId!)).orderBy(desc(projects.updatedAt)).limit(100);
  res.json(ListProjectsResponse.parse(rows.map(view)));
});

router.post("/projects", async (req, res) => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success || !parsed.data.title.trim() || !validDocument(parsed.data.scene)) {
    res.status(400).json({ error: "Supply a title and a valid bounded scene recipe." }); return;
  }
  const ownerId = getAuth(req).userId!;
  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${ownerId}, 0))`);
    const existing = await tx.select({ id: projects.id }).from(projects).where(eq(projects.ownerId, ownerId)).limit(100);
    if (existing.length >= 100) return null;
    const [p] = await tx.insert(projects).values({ id: randomUUID(), ownerId, title: parsed.data.title.trim(), scene: parsed.data.scene }).returning();
    await tx.insert(revisions).values({ projectId: p!.id, revision: 1, title: p!.title, scene: p!.scene });
    return p!;
  });
  if (!result) { res.status(409).json({ error: "Cloud library is limited to 100 projects." }); return; }
  res.status(201).json(CreateProjectResponse.parse(view(result)));
});

router.put("/projects/:id", async (req, res) => {
  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success || !parsed.data.title.trim() || !validDocument(parsed.data.scene)) {
    res.status(400).json({ error: "Invalid title, scene, or revision." }); return;
  }
  const result = await db.transaction(async (tx) => {
    const [p] = await tx.select().from(projects).where(and(eq(projects.id, String(req.params.id)), eq(projects.ownerId, getAuth(req).userId!))).for("update");
    if (!p) return { status: 404 as const };
    if (p.revision !== parsed.data.expectedRevision) return { status: 409 as const };
    const [next] = await tx.update(projects).set({ title: parsed.data.title.trim(), scene: parsed.data.scene, revision: p.revision + 1, updatedAt: new Date() }).where(eq(projects.id, p.id)).returning();
    await tx.insert(revisions).values({ projectId: p.id, title: next!.title, scene: next!.scene, revision: next!.revision });
    await tx.delete(revisions).where(and(eq(revisions.projectId, p.id), lt(revisions.revision, next!.revision - 29)));
    return { status: 200 as const, project: next! };
  });
  if (result.status !== 200) { res.status(result.status).json({ error: result.status === 409 ? "Project changed elsewhere. Reload before saving." : "Project not found." }); return; }
  res.json(UpdateProjectResponse.parse(view(result.project)));
});

router.delete("/projects/:id", async (req, res) => {
  const rows = await db.delete(projects).where(and(eq(projects.id, String(req.params.id)), eq(projects.ownerId, getAuth(req).userId!))).returning({ id: projects.id });
  if (!rows.length) { res.status(404).json({ error: "Project not found." }); return; }
  res.status(204).end();
});

router.get("/projects/:id/revisions", async (req, res) => {
  const [p] = await db.select({ id: projects.id }).from(projects).where(and(eq(projects.id, String(req.params.id)), eq(projects.ownerId, getAuth(req).userId!)));
  if (!p) { res.status(404).json({ error: "Project not found." }); return; }
  const rows = await db.select().from(revisions).where(eq(revisions.projectId, p.id)).orderBy(desc(revisions.revision)).limit(30);
  res.json(ListRevisionsResponse.parse(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))));
});

for (const method of ["post", "delete"] as const) {
  router[method]("/projects/:id/publish", async (req, res) => {
    const updated = await db.transaction(async (tx) => {
      const [p] = await tx.select().from(projects).where(and(eq(projects.id, String(req.params.id)), eq(projects.ownerId, getAuth(req).userId!))).for("update");
      if (!p) return null;
      // Repeated publish is idempotent for an unchanged scene.
      if (method === "post" && p.publishedId) {
        const [existing] = await tx.select().from(publications).where(eq(publications.id, p.publishedId));
        if (existing?.revision === p.revision) return p;
      }
      await tx.delete(publications).where(eq(publications.projectId, p.id));
      const publishedId = method === "post" ? randomUUID() : null;
      if (publishedId) await tx.insert(publications).values({ id: publishedId, projectId: p.id, title: p.title, scene: p.scene, revision: p.revision });
      const [next] = await tx.update(projects).set({ publishedId }).where(eq(projects.id, p.id)).returning();
      return next!;
    });
    if (!updated) { res.status(404).json({ error: "Project not found." }); return; }
    res.json(UpdateProjectResponse.parse(view(updated)));
  });
}

export default router;
