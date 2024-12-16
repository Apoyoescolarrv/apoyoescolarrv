import { db } from "@/db/drizzle";
import { classes } from "@/db/schema";
import {
  buildEndpoint,
  getPaginationParams,
  getSearchQuery,
  PaginatedResponse,
} from "@/lib/build-endpoint";
import { verifyToken } from "@/lib/verify-token";
import { count, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = buildEndpoint(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = getPaginationParams(searchParams);

    const searchQuery = getSearchQuery(searchParams, classes, {
      searchField: "title",
      transliterateSearch: true,
    });

    const baseQuery = db.select().from(classes);
    const query = searchQuery ? baseQuery.where(searchQuery) : baseQuery;

    const [totalCount] = await db
      .select({ count: count() })
      .from(query.as("filtered_classes"));

    const classesList = await query
      .limit(limit)
      .offset(offset)
      .orderBy(classes.createdAt);

    const response: PaginatedResponse<typeof classes.$inferSelect> = {
      data: classesList,
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
    errorMessage: "Error al obtener las clases",
    pagination: true,
    search: {
      searchField: "title",
      transliterateSearch: true,
    },
  }
);

export const POST = buildEndpoint(
  verifyToken(async (req, userId, isAdmin) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para crear clases" },
        { status: 403 }
      );
    }

    const { title, description, videoUrl, duration, isPreview } =
      await req.json();

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: "El título y la URL del video son requeridos" },
        { status: 400 }
      );
    }

    const [newClass] = await db
      .insert(classes)
      .values({
        title,
        description,
        videoUrl,
        duration,
        isPreview: isPreview ?? false,
      })
      .returning();

    return NextResponse.json({ class: newClass });
  }),
  { errorMessage: "Error al crear la clase" }
);

export const PUT = buildEndpoint(
  verifyToken(async (req, userId, isAdmin) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar clases" },
        { status: 403 }
      );
    }

    const { id, title, description, videoUrl, duration, isPreview } =
      await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "El ID de la clase es requerido" },
        { status: 400 }
      );
    }

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: "El título y la URL del video son requeridos" },
        { status: 400 }
      );
    }

    const [updatedClass] = await db
      .update(classes)
      .set({
        title,
        description,
        videoUrl,
        duration,
        isPreview,
      })
      .where(eq(classes.id, id))
      .returning();

    if (!updatedClass) {
      return NextResponse.json(
        { error: "Clase no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ class: updatedClass });
  }),
  { errorMessage: "Error al actualizar la clase" }
);

export const DELETE = buildEndpoint(
  verifyToken(async (req, userId, isAdmin) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar clases" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "El ID de la clase es requerido" },
        { status: 400 }
      );
    }

    const [deletedClass] = await db
      .delete(classes)
      .where(eq(classes.id, id))
      .returning();

    if (!deletedClass) {
      return NextResponse.json(
        { error: "Clase no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ class: deletedClass });
  }),
  { errorMessage: "Error al eliminar la clase" }
);
