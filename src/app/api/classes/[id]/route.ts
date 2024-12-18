import { db } from "@/db/drizzle";
import { classes } from "@/db/schema";
import { buildEndpoint } from "@/lib/build-endpoint";
import { verifyToken } from "@/lib/verify-token";
import { eq, count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { moduleClasses } from "@/db/schema";

export const GET = buildEndpoint(
  verifyToken(async (req: NextRequest, userId: string, isAdmin: boolean) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const params = { id: req.url.split("/").pop()! };

    const result = await db
      .select()
      .from(classes)
      .where(eq(classes.id, params.id));

    if (!result[0]) {
      return NextResponse.json(
        { error: "No se encontró la clase" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  }),
  {
    errorMessage: "Error al obtener la clase",
  }
);

export const PATCH = buildEndpoint(
  verifyToken(async (req: NextRequest, userId: string, isAdmin: boolean) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const params = { id: req.url.split("/").pop()! };
    const data = await req.json();

    const [updatedClass] = await db
      .update(classes)
      .set(data)
      .where(eq(classes.id, params.id))
      .returning();

    if (!updatedClass) {
      return NextResponse.json(
        { error: "No se encontró la clase" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedClass);
  }),
  {
    errorMessage: "Error al actualizar la clase",
  }
);

export const DELETE = buildEndpoint(
  verifyToken(async (req: NextRequest, userId: string, isAdmin: boolean) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const params = { id: req.url.split("/").pop()! };

    // Verificar si la clase está en uso
    const moduleClassesCount = await db
      .select({ count: count() })
      .from(moduleClasses)
      .where(eq(moduleClasses.classId, params.id))
      .then((res) => res[0].count);

    if (moduleClassesCount > 0) {
      const searchParams = new URL(req.url).searchParams;
      const force = searchParams.get("force") === "true";

      if (!force) {
        return NextResponse.json(
          {
            error: "La clase está siendo utilizada en uno o más cursos",
            inUse: true,
            moduleClassesCount,
          },
          { status: 400 }
        );
      }

      // Si force=true, primero eliminar las referencias
      await db
        .delete(moduleClasses)
        .where(eq(moduleClasses.classId, params.id));
    }

    // Eliminar la clase
    const [deletedClass] = await db
      .delete(classes)
      .where(eq(classes.id, params.id))
      .returning();

    if (!deletedClass) {
      return NextResponse.json(
        { error: "No se encontró la clase" },
        { status: 404 }
      );
    }

    return NextResponse.json(deletedClass);
  }),
  {
    errorMessage: "Error al eliminar la clase",
  }
);
