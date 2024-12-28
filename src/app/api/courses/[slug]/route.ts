import { db } from "@/db/drizzle";
import {
  courses,
  moduleClasses,
  modules,
  classes,
  categories,
} from "@/db/schema";
import { buildEndpoint } from "@/lib/build-endpoint";
import { CourseModule, ModuleClass } from "@/types/course";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = buildEndpoint(
  async (req: NextRequest) => {
    const slug = req.nextUrl.pathname.split("/")[3];

    const course = await db
      .select({
        courses: courses,
        modules: modules,
        module_classes: moduleClasses,
        classes: classes,
        category: categories,
      })
      .from(courses)
      .where(eq(courses.slug, slug))
      .leftJoin(modules, eq(modules.courseId, courses.id))
      .leftJoin(moduleClasses, eq(moduleClasses.moduleId, modules.id))
      .leftJoin(classes, eq(classes.id, moduleClasses.classId))
      .leftJoin(categories, eq(categories.id, courses.categoryId));

    if (!course || course.length === 0) {
      return NextResponse.json(
        { error: "No se encontró el curso" },
        { status: 404 }
      );
    }

    const courseData = course[0].courses;
    const courseModules = course.reduce((acc, row) => {
      if (!row.modules) return acc;

      const moduleId = row.modules.id;
      if (!acc[moduleId]) {
        acc[moduleId] = {
          ...row.modules,
          order: row.modules.order ?? 0,
          moduleClasses: [],
        };
      }

      if (row.module_classes && row.classes) {
        acc[moduleId].moduleClasses.push({
          ...row.module_classes,
          order: row.module_classes.order ?? 0,
          class: row.classes,
        });
      }

      return acc;
    }, {} as Record<string, CourseModule & { moduleClasses: (ModuleClass & { class: typeof classes.$inferSelect })[] }>);

    return NextResponse.json({
      course: {
        ...courseData,
        category: course[0].category,
        modules: Object.values(courseModules).sort((a, b) => a.order - b.order),
      },
    });
  },
  {
    errorMessage: "Error al obtener el curso",
  }
);
