import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";
import { buildEndpoint } from "@/lib/build-endpoint";
import { buildWhereClause } from "@/lib/build-filters";
import { parseFilters } from "@/lib/filters";
import { verifyToken } from "@/lib/verify-token";
import { asc, count, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";

export const GET = buildEndpoint(
  async (req) => {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const filters =
      parseFilters<(typeof categories._)["columns"]>(searchParams);

    const offset = (page - 1) * limit;

    if (search) {
      filters.push({
        field: "name",
        operator: "like",
        value: search,
      });
    }

    const whereClause = buildWhereClause(categories, filters);
    const parentCategories = alias(categories, "parent_categories");

    const [categoriesList, total] = await Promise.all([
      db
        .select({
          id: categories.id,
          name: categories.name,
          parentId: categories.parentId,
          createdAt: categories.createdAt,
          parentName: parentCategories.name,
        })
        .from(categories)
        .leftJoin(
          parentCategories,
          eq(categories.parentId, parentCategories.id)
        )
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(asc(categories.createdAt)),
      db
        .select({ count: count() })
        .from(categories)
        .where(whereClause)
        .then((res) => Number(res[0].count)),
    ]);

    return NextResponse.json({
      data: categoriesList,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  },
  { errorMessage: "Error al obtener las categorías" }
);

export const POST = buildEndpoint(
  verifyToken(async (req, userId, isAdmin) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para crear categorías" },
        { status: 403 }
      );
    }

    const { name, parentId } = await req.json();
    const [newCategory] = await db
      .insert(categories)
      .values({ name, parentId })
      .returning();
    return NextResponse.json({ category: newCategory });
  }),
  { errorMessage: "Error al crear la categoría" }
);

export const PUT = buildEndpoint(
  verifyToken(async (req, userId, isAdmin) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar categorías" },
        { status: 403 }
      );
    }

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
  }),
  { errorMessage: "Error al actualizar la categoría" }
);

export const DELETE = buildEndpoint(
  verifyToken(async (req, userId, isAdmin) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar categorías" },
        { status: 403 }
      );
    }

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
  }),
  { errorMessage: "Error al eliminar la categoría" }
);
