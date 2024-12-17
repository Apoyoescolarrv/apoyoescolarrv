import { db } from "@/db/drizzle";
import {
  classes,
  modules,
  courses,
  purchases,
  moduleClasses,
} from "@/db/schema";
import { buildEndpoint } from "@/lib/build-endpoint";
import { verifyToken } from "@/lib/verify-token";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = buildEndpoint(
  (req: NextRequest) =>
    verifyToken(async (req, userId) => {
      const classId = req.nextUrl.pathname.split("/")[3];

      const [classData] = await db
        .select({
          classId: classes.id,
          moduleId: modules.id,
          isPreview: classes.isPreview,
          videoUrl: classes.videoUrl,
          courseId: courses.id,
        })
        .from(classes)
        .innerJoin(moduleClasses, eq(classes.id, moduleClasses.classId))
        .innerJoin(modules, eq(moduleClasses.moduleId, modules.id))
        .innerJoin(courses, eq(modules.courseId, courses.id))
        .where(eq(classes.id, classId));

      if (!classData) {
        return NextResponse.json(
          { error: "Clase no encontrada" },
          { status: 404 }
        );
      }

      if (classData.isPreview) {
        return NextResponse.json({ url: classData.videoUrl });
      }

      const [purchase] = await db
        .select()
        .from(purchases)
        .where(
          and(
            eq(purchases.userId, userId),
            eq(purchases.courseId, classData.courseId),
            eq(purchases.paymentStatus, "completed")
          )
        );

      if (!purchase) {
        return NextResponse.json(
          { error: "No tienes acceso a esta clase" },
          { status: 403 }
        );
      }

      return NextResponse.json({ url: classData.videoUrl });
    })(req),
  { errorMessage: "Error al obtener la URL del video" }
);
