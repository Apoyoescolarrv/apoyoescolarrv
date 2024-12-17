import { db } from "@/db/drizzle";
import { courses, modules, moduleClasses } from "@/db/schema";
import {
  buildEndpoint,
  getPaginationParams,
  getSearchQuery,
} from "@/lib/build-endpoint";
import { count, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/verify-token";
import { CreateCourseData } from "@/api/courses/service";
import { PaginatedResponse } from "@/types/pagination";

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

export const POST = buildEndpoint(
  verifyToken(async (req: NextRequest, userId: string, isAdmin: boolean) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const data = (await req.json()) as CreateCourseData;

    // Crear el curso
    const [course] = await db
      .insert(courses)
      .values({
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        price: Number(data.price),
        isActive: data.isActive,
      })
      .returning();

    // Crear los módulos
    const createdModules = await Promise.all(
      data.modules.map(async (moduleData, index) => {
        const [createdModule] = await db
          .insert(modules)
          .values({
            title: moduleData.title,
            courseId: course.id,
            order: moduleData.order ?? index,
          })
          .returning();

        // Crear las clases del módulo
        if (moduleData.classes?.length) {
          await db.insert(moduleClasses).values(
            moduleData.classes.map((classData, classIndex) => ({
              moduleId: createdModule.id,
              classId: classData.classId,
              order: classData.order ?? classIndex,
            }))
          );
        }

        return createdModule;
      })
    );

    return NextResponse.json({
      course: {
        ...course,
        modules: createdModules,
      },
    });
  })
);

export const PUT = buildEndpoint(
  verifyToken(async (req: NextRequest, userId: string, isAdmin: boolean) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const data = await req.json();
    const { id, modules: newModules, ...courseData } = data;

    // Actualizar el curso
    const [course] = await db
      .update(courses)
      .set(courseData)
      .where(eq(courses.id, id))
      .returning();

    // Eliminar módulos y clases existentes
    await db
      .delete(moduleClasses)
      .where(
        inArray(
          moduleClasses.moduleId,
          db
            .select({ id: modules.id })
            .from(modules)
            .where(eq(modules.courseId, id))
        )
      );
    await db.delete(modules).where(eq(modules.courseId, id));

    // Crear los nuevos módulos
    const createdModules = await Promise.all(
      newModules.map(
        async (moduleData: CreateCourseData["modules"][0], index: number) => {
          const [createdModule] = await db
            .insert(modules)
            .values({
              title: moduleData.title,
              courseId: id,
              order: moduleData.order ?? index,
            })
            .returning();

          // Crear las clases del módulo
          if (moduleData.moduleClasses?.length) {
            await db.insert(moduleClasses).values(
              moduleData.moduleClasses.map(
                (
                  classData: { classId: string; order?: number },
                  classIndex: number
                ) => ({
                  moduleId: createdModule.id,
                  classId: classData.classId,
                  order: classData.order ?? classIndex,
                })
              )
            );
          }

          return createdModule;
        }
      )
    );

    return NextResponse.json({
      course: {
        ...course,
        modules: createdModules,
      },
    });
  })
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
