import { db } from "@/db/drizzle";
import { courses, purchases } from "@/db/schema";
import { buildEndpoint } from "@/lib/build-endpoint";
import { verifyToken } from "@/lib/verify-token";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = buildEndpoint(
  verifyToken(async (req, userId) => {
    const purchasedCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        thumbnail: courses.thumbnail,
        price: courses.price,
        isActive: courses.isActive,
        createdAt: courses.createdAt,
        slug: courses.slug,
        updatedAt: courses.updatedAt,
      })
      .from(purchases)
      .innerJoin(courses, eq(purchases.courseId, courses.id))
      .where(
        and(
          eq(purchases.userId, userId),
          eq(purchases.paymentStatus, "completed")
        )
      );

    return NextResponse.json({
      data: purchasedCourses,
    });
  }),
  { errorMessage: "Error al obtener los cursos comprados" }
);
