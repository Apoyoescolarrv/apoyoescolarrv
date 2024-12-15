import { db } from "@/db/drizzle";
import { categories, courses, users } from "@/db/schema";
import { buildEndpoint } from "@/lib/build-endpoint";
import { count } from "drizzle-orm";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/verify-token";
import { AdminData } from "@/api/admin";

export const GET = buildEndpoint(
  verifyToken(async (req, userId, isAdmin) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para ver estas estadísticas" },
        { status: 403 }
      );
    }

    // Obtener estadísticas y datos
    const [[categoriesCount], [coursesCount], [usersCount]] = await Promise.all(
      [
        db.select({ count: count() }).from(categories),
        db.select({ count: count() }).from(courses),
        db.select({ count: count() }).from(users),
        db.select().from(categories).orderBy(categories.createdAt),
        db.select().from(courses).orderBy(courses.createdAt),
      ]
    );

    const data: AdminData = {
      stats: {
        categories: categoriesCount.count,
        courses: coursesCount.count,
        users: usersCount.count,
      },
    };

    return NextResponse.json(data);
  }),
  {
    errorMessage: "Error al obtener las estadísticas",
  }
);
