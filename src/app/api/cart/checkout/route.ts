import { db } from "@/db/drizzle";
import { cartItems, courses, purchases } from "@/db/schema";
import { buildEndpoint } from "@/lib/build-endpoint";
import { verifyToken } from "@/lib/verify-token";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const POST = buildEndpoint(
  verifyToken(async (req, userId) => {
    const { slugs } = await req.json();

    if (!slugs?.length) {
      return NextResponse.json(
        { error: "No se especificaron cursos" },
        { status: 400 }
      );
    }

    const cartCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
      })
      .from(cartItems)
      .innerJoin(courses, eq(cartItems.courseId, courses.id))
      .where(and(eq(cartItems.userId, userId)));

    if (cartCourses.length === 0) {
      return NextResponse.json(
        { error: "No hay cursos en el carrito" },
        { status: 400 }
      );
    }

    await db.insert(purchases).values(
      cartCourses.map((course) => ({
        userId,
        courseId: course.id,
        paymentStatus: "completed",
        paymentDetails: {
          method: "mock",
          timestamp: new Date().toISOString(),
        },
      }))
    );

    await db.delete(cartItems).where(eq(cartItems.userId, userId));

    return NextResponse.json({
      message: "Compra realizada con éxito",
      data: cartCourses,
    });
  }),
  { errorMessage: "Error al procesar la compra" }
);
