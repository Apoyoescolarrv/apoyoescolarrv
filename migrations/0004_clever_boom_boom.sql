ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "classes" DROP CONSTRAINT "classes_module_id_modules_id_fk";
--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT "courses_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "modules" DROP CONSTRAINT "modules_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "shared_classes" DROP CONSTRAINT "shared_classes_source_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "shared_classes" DROP CONSTRAINT "shared_classes_target_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "shared_classes" DROP CONSTRAINT "shared_classes_class_id_classes_id_fk";
--> statement-breakpoint
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_class_id_classes_id_fk";
--> statement-breakpoint
ALTER TABLE "user_progress" ALTER COLUMN "progress_time" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "video_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "duration" integer;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "last_watched_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_classes" ADD CONSTRAINT "shared_classes_source_course_id_courses_id_fk" FOREIGN KEY ("source_course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_classes" ADD CONSTRAINT "shared_classes_target_course_id_courses_id_fk" FOREIGN KEY ("target_course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_classes" ADD CONSTRAINT "shared_classes_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" DROP COLUMN "content";