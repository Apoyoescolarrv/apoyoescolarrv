import { db } from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { buildEndpoint } from "@/lib/build-endpoint";
import { verifyToken } from "@/lib/verify-token";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const POST = buildEndpoint(
  (req: NextRequest) =>
    verifyToken(async (req, userId) => {
      const classId = req.nextUrl.pathname.split("/")[3];
      const { progressTime, completed } = await req.json();

      // Buscar progreso existente
      const [existingProgress] = await db
        .select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.classId, classId)
          )
        );

      if (existingProgress) {
        // Actualizar progreso existente
        const [updatedProgress] = await db
          .update(userProgress)
          .set({
            progressTime,
            completed,
            lastWatchedAt: new Date(),
          })
          .where(eq(userProgress.id, existingProgress.id))
          .returning();

        return NextResponse.json({ progress: updatedProgress });
      } else {
        // Crear nuevo progreso
        const [newProgress] = await db
          .insert(userProgress)
          .values({
            userId,
            classId,
            progressTime,
            completed,
          })
          .returning();

        return NextResponse.json({ progress: newProgress });
      }
    })(req),
  { errorMessage: "Error al actualizar el progreso" }
);

export const GET = buildEndpoint(
  (req: NextRequest) =>
    verifyToken(async (req, userId) => {
      const classId = req.nextUrl.pathname.split("/")[3];

      // Obtener progreso
      const [progress] = await db
        .select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.classId, classId)
          )
        );

      if (!progress) {
        return NextResponse.json(
          { error: "No se encontró progreso para esta clase" },
          { status: 404 }
        );
      }

      return NextResponse.json({ progress });
    })(req),
  { errorMessage: "Error al obtener el progreso" }
);
