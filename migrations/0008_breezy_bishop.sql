ALTER TABLE "module_classes" ALTER COLUMN "order" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "module_classes" ALTER COLUMN "order" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "modules" ALTER COLUMN "order" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "modules" ALTER COLUMN "order" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "module_classes" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "created_at" timestamp DEFAULT now();