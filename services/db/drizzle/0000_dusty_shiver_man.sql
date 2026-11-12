CREATE TABLE "studio_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"title" text NOT NULL,
	"scene" jsonb NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"published_id" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_publications" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"title" text NOT NULL,
	"scene" jsonb NOT NULL,
	"revision" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_revisions" (
	"project_id" text NOT NULL,
	"revision" integer NOT NULL,
	"title" text NOT NULL,
	"scene" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "studio_revisions_project_id_revision_pk" PRIMARY KEY("project_id","revision")
);
--> statement-breakpoint
ALTER TABLE "studio_publications" ADD CONSTRAINT "studio_publications_project_id_studio_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."studio_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_revisions" ADD CONSTRAINT "studio_revisions_project_id_studio_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."studio_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "studio_projects_owner_idx" ON "studio_projects" USING btree ("owner_id");