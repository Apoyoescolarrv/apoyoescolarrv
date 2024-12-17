import { db } from "@/db/drizzle";
import { courses, moduleClasses, modules } from "@/db/schema";
import { buildEndpoint } from "@/lib/build-endpoint";
import { verifyToken } from "@/lib/verify-token";
import { CourseModule, ModuleClass } from "@/types/course";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = buildEndpoint(
  verifyToken(async (req: NextRequest, userId: string, isAdmin: boolean) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const params = { id: req.url.split("/").pop()! };

    const course = await db
      .select()
      .from(courses)
      .where(eq(courses.id, params.id))
      .leftJoin(modules, eq(modules.courseId, courses.id))
      .leftJoin(moduleClasses, eq(moduleClasses.moduleId, modules.id));

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

      if (row.module_classes) {
        acc[moduleId].moduleClasses.push({
          ...row.module_classes,
          order: row.module_classes.order ?? 0,
        });
      }

      return acc;
    }, {} as Record<string, CourseModule & { moduleClasses: ModuleClass[] }>);

    return NextResponse.json({
      course: {
        ...courseData,
        modules: Object.values(courseModules),
      },
    });
  }),
  {
    errorMessage: "Error al obtener el curso",
  }
);
