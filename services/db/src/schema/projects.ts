import { pgTable, text, integer, jsonb, timestamp, index, primaryKey } from "drizzle-orm/pg-core";

export const projects = pgTable("studio_projects", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  title: text("title").notNull(),
  scene: jsonb("scene").$type<Record<string, unknown>>().notNull(),
  revision: integer("revision").notNull().default(1),
  publishedId: text("published_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("studio_projects_owner_idx").on(t.ownerId)]);

export const revisions = pgTable("studio_revisions", {
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  revision: integer("revision").notNull(),
  title: text("title").notNull(),
  scene: jsonb("scene").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.projectId, t.revision] })]);

export const publications = pgTable("studio_publications", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  scene: jsonb("scene").$type<Record<string, unknown>>().notNull(),
  revision: integer("revision").notNull(),
});
