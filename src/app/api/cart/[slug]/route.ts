import { db } from "@/db/drizzle";
import { cartItems, courses } from "@/db/schema";
import { buildEndpoint } from "@/lib/build-endpoint";
import { verifyToken } from "@/lib/verify-token";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = buildEndpoint(
  verifyToken(async (req: NextRequest, userId: string) => {
    const slug = req.url.split("/").pop();

    if (!slug) {
      return NextResponse.json(
        { error: "No se especificó el curso" },
        { status: 400 }
      );
    }

    const course = await db.query.courses.findFirst({
      where: eq(courses.slug, slug),
    });

    if (!course) {
      return NextResponse.json(
        { error: "El curso no existe" },
        { status: 404 }
      );
    }

    await db
      .delete(cartItems)
      .where(
        and(eq(cartItems.userId, userId), eq(cartItems.courseId, course.id))
      );

    return NextResponse.json({
      message: "Curso eliminado del carrito",
    });
  }),
  { errorMessage: "Error al eliminar del carrito" }
);
