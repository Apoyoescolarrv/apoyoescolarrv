import { CreateCourseData } from "@/api/courses/service";
import { db } from "@/db/drizzle";
import {
  courses,
  moduleClasses,
  modules,
  categories,
  enrollments,
  classes,
} from "@/db/schema";
import { buildEndpoint } from "@/lib/build-endpoint";
import { buildWhereClause } from "@/lib/build-filters";
import { parseFilters } from "@/lib/filters";
import { verifyToken } from "@/lib/verify-token";
import { asc, count, eq, inArray, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = buildEndpoint(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const filters = parseFilters<(typeof courses._)["columns"]>(searchParams);

    const offset = (page - 1) * limit;

    if (search) {
      filters.push({
        field: "title",
        operator: "like",
        value: search,
      });
    }

    const whereClause = buildWhereClause(courses, filters);

    const [coursesList, total] = await Promise.all([
      db
        .select({
          id: courses.id,
          title: courses.title,
          description: courses.description,
          price: courses.price,
          isActive: courses.isActive,
          whatsappGroupId: courses.whatsappGroupId,
          thumbnail: courses.thumbnail,
          previewVideoUrl: courses.previewVideoUrl,
          createdAt: courses.createdAt,
          categoryId: courses.categoryId,
          category: {
            id: categories.id,
            name: categories.name,
          },
          _count: {
            modules: sql`(
              SELECT COUNT(*)::int
              FROM ${modules}
              WHERE ${modules.courseId} = ${courses.id}
            )`.as("modules_count"),
            students: sql`(
              SELECT COUNT(*)::int
              FROM ${enrollments}
              WHERE ${enrollments.courseId} = ${courses.id}
            )`.as("students_count"),
          },
          totalDuration: sql`(
            SELECT COALESCE(SUM(${classes.duration}), 0)::int
            FROM ${moduleClasses}
            INNER JOIN ${modules} ON ${modules.id} = ${moduleClasses.moduleId}
            INNER JOIN ${classes} ON ${classes.id} = ${moduleClasses.classId}
            WHERE ${modules.courseId} = ${courses.id}
          )`.as("total_duration"),
        })
        .from(courses)
        .leftJoin(categories, eq(courses.categoryId, categories.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(asc(courses.createdAt)),
      db
        .select({ count: count() })
        .from(courses)
        .where(whereClause)
        .then((res) => Number(res[0].count)),
    ]);

    return NextResponse.json({
      data: coursesList,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  },
  { errorMessage: "Error al obtener los cursos" }
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
        whatsappGroupId: data.whatsappGroupId,
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
