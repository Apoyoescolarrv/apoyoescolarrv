import { db } from "@/db/drizzle";
import { cartItems } from "@/db/schema";
import { buildEndpoint } from "@/lib/build-endpoint";
import { verifyToken } from "@/lib/verify-token";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const DELETE = buildEndpoint(
  verifyToken(async (req, userId) => {
    const courseId = req.url.split("/").pop();

    if (!courseId) {
      return NextResponse.json(
        { error: "No se especificó el curso" },
        { status: 400 }
      );
    }

    await db
      .delete(cartItems)
      .where(
        and(eq(cartItems.userId, userId), eq(cartItems.courseId, courseId))
      );

    return NextResponse.json({
      message: "Curso eliminado del carrito",
    });
  }),
  { errorMessage: "Error al eliminar del carrito" }
);
