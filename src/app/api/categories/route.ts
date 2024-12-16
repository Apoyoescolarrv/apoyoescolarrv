import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";
import {
  buildEndpoint,
  getPaginationParams,
  getSearchQuery,
  PaginatedResponse,
} from "@/lib/build-endpoint";
import { count, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = buildEndpoint(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = getPaginationParams(searchParams);

    const searchQuery = getSearchQuery(searchParams, categories, {
      searchField: "name",
      transliterateSearch: true,
    });

    const baseQuery = db.select().from(categories);
    const query = searchQuery ? baseQuery.where(searchQuery) : baseQuery;

    const [totalCount] = await db
      .select({ count: count() })
      .from(query.as("filtered_categories"));

    const categoriesList = await query.limit(limit).offset(offset);

    const response: PaginatedResponse<typeof categories.$inferSelect> = {
      data: categoriesList,
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
    errorMessage: "Error al obtener las categorías",
    pagination: true,
    search: {
      searchField: "name",
      transliterateSearch: true,
    },
  }
);

export const POST = buildEndpoint(
  async (req: NextRequest) => {
    const { name, parentId } = await req.json();
    const [newCategory] = await db
      .insert(categories)
      .values({ name, parentId })
      .returning();
    return NextResponse.json({ category: newCategory });
  },
  { errorMessage: "Error al crear la categoría" }
);

export const PUT = buildEndpoint(
  async (req: NextRequest) => {
    const { id, name, parentId } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "El ID de la categoría es requerido" },
        { status: 400 }
      );
    }

    const [updatedCategory] = await db
      .update(categories)
      .set({ name, parentId })
      .where(eq(categories.id, id))
      .returning();

    if (!updatedCategory) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ category: updatedCategory });
  },
  { errorMessage: "Error al actualizar la categoría" }
);

export const DELETE = buildEndpoint(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "El ID de la categoría es requerido" },
        { status: 400 }
      );
    }

    await db
      .update(categories)
      .set({ parentId: null })
      .where(eq(categories.parentId, id));

    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (!deletedCategory) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ category: deletedCategory });
  },
  { errorMessage: "Error al eliminar la categoría" }
);
