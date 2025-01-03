import {
  AnyPgColumn,
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  parentId: uuid("parent_id").references((): AnyPgColumn => categories.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  price: integer("price").notNull(),
  isActive: boolean("is_active").default(true),
  whatsappGroupId: text("whatsapp_group_id"),
  thumbnail: text("thumbnail"),
  previewVideoUrl: text("preview_video_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const classes = pgTable("classes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  duration: integer("duration"),
  isPreview: boolean("is_preview").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const moduleClasses = pgTable("module_classes", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id")
    .references(() => modules.id, { onDelete: "cascade" })
    .notNull(),
  classId: uuid("class_id")
    .references(() => classes.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phoneNumber: text("phone_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isAdmin: boolean("is_admin").default(false),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const purchases = pgTable("purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  courseId: uuid("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
  paymentDetails: jsonb("payment_details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  classId: uuid("class_id")
    .references(() => classes.id, { onDelete: "cascade" })
    .notNull(),
  completed: boolean("completed").default(false),
  progressTime: integer("progress_time").default(0),
  lastWatchedAt: timestamp("last_watched_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const userCourseProgress = pgTable("user_course_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  courseId: uuid("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  progressPercentage: integer("progress_percentage").default(0).notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  courseId: uuid("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
