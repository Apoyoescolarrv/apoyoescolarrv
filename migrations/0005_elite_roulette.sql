CREATE TABLE "module_classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"order" integer
);
--> statement-breakpoint
ALTER TABLE "classes" DROP CONSTRAINT "classes_module_id_modules_id_fk";
--> statement-breakpoint
ALTER TABLE "module_classes" ADD CONSTRAINT "module_classes_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_classes" ADD CONSTRAINT "module_classes_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" DROP COLUMN "module_id";--> statement-breakpoint
ALTER TABLE "classes" DROP COLUMN "order";