import { db } from "@/db/drizzle";
import { courses } from "@/db/schema";
import {
  buildEndpoint,
  getPaginationParams,
  getSearchQuery,
  PaginatedResponse,
} from "@/lib/build-endpoint";
import { count, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/verify-token";

export const GET = buildEndpoint(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = getPaginationParams(searchParams);

    const searchQuery = getSearchQuery(searchParams, courses, {
      searchField: "title",
      transliterateSearch: true,
    });

    const baseQuery = db.select().from(courses);
    const query = searchQuery ? baseQuery.where(searchQuery) : baseQuery;

    const [totalCount] = await db
      .select({ count: count() })
      .from(query.as("filtered_courses"));

    const coursesList = await query
      .limit(limit)
      .offset(offset)
      .orderBy(courses.createdAt);

    const response: PaginatedResponse<typeof courses.$inferSelect> = {
      data: coursesList,
      pagination: {
        total: totalCount.count,
        currentPage: page,
        totalPages: Math.ceil(totalCount.count / limit),
        limit,
      },
    };

    return NextResponse.json(response);
  },
  {
    errorMessage: "Error al obtener los cursos",
    pagination: true,
    search: {
      searchField: "title",
      transliterateSearch: true,
    },
  }
);

export const POST = verifyToken(
  async (req: NextRequest, userId: string, isAdmin: boolean) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para crear cursos" },
        { status: 403 }
      );
    }

    const courseData = await req.json();
    const [newCourse] = await db.insert(courses).values(courseData).returning();
    return NextResponse.json({ course: newCourse });
  }
);

export const PUT = verifyToken(
  async (req: NextRequest, userId: string, isAdmin: boolean) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar cursos" },
        { status: 403 }
      );
    }

    const { id, ...courseData } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "El ID del curso es requerido" },
        { status: 400 }
      );
    }

    const [updatedCourse] = await db
      .update(courses)
      .set(courseData)
      .where(eq(courses.id, id))
      .returning();

    if (!updatedCourse) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ course: updatedCourse });
  }
);

export const DELETE = verifyToken(
  async (req: NextRequest, userId: string, isAdmin: boolean) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar cursos" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "El ID del curso es requerido" },
        { status: 400 }
      );
    }

    const [deletedCourse] = await db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning();

    if (!deletedCourse) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ course: deletedCourse });
  }
);
