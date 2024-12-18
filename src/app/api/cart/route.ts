import { db } from "@/db/drizzle";
import { cartItems, courses } from "@/db/schema";
import { buildEndpoint } from "@/lib/build-endpoint";
import { verifyToken } from "@/lib/verify-token";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = buildEndpoint(
  verifyToken(async (req, userId) => {
    const userCartItems = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        thumbnail: courses.thumbnail,
        price: courses.price,
        isActive: courses.isActive,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
      })
      .from(cartItems)
      .innerJoin(courses, eq(cartItems.courseId, courses.id))
      .where(eq(cartItems.userId, userId));

    return NextResponse.json({ data: userCartItems });
  }),
  { errorMessage: "Error al obtener el carrito" }
);

export const POST = buildEndpoint(
  verifyToken(async (req, userId) => {
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "No se especificó el curso" },
        { status: 400 }
      );
    }

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      return NextResponse.json(
        { error: "El curso no existe" },
        { status: 404 }
      );
    }

    const existingItem = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.userId, userId),
        eq(cartItems.courseId, courseId)
      ),
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "El curso ya está en el carrito" },
        { status: 400 }
      );
    }

    await db.insert(cartItems).values({
      userId,
      courseId,
    });

    return NextResponse.json({
      message: "Curso agregado al carrito",
      data: course,
    });
  }),
  { errorMessage: "Error al agregar al carrito" }
);

export const DELETE = buildEndpoint(
  verifyToken(async (req, userId) => {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return NextResponse.json({
      message: "Carrito vaciado con éxito",
    });
  }),
  { errorMessage: "Error al vaciar el carrito" }
);
