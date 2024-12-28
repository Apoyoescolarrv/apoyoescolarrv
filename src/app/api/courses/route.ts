import { CreateCourseData } from "@/api/courses/service";
import { db } from "@/db/drizzle";
import {
  categories,
  classes,
  courses,
  moduleClasses,
  modules,
  purchases,
} from "@/db/schema";
import { buildEndpoint } from "@/lib/build-endpoint";
import { buildWhereClause } from "@/lib/build-filters";
import { parseFilters } from "@/lib/filters";
import { verifyToken } from "@/lib/verify-token";
import { asc, count, desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = buildEndpoint(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const filters = parseFilters<(typeof courses._)["columns"]>(searchParams);
    const orderByParam = searchParams.get("orderBy");

    const offset = (page - 1) * limit;

    if (search) {
      filters.push({
        field: "title",
        operator: "like",
        value: search,
      });
    }

    const whereClause = buildWhereClause(courses, filters);

    let orderByClause;
    if (orderByParam) {
      try {
        const { field, direction } = JSON.parse(orderByParam);
        switch (field) {
          case "price":
            orderByClause =
              direction === "asc" ? asc(courses.price) : desc(courses.price);
            break;
          case "title":
            orderByClause =
              direction === "asc" ? asc(courses.title) : desc(courses.title);
            break;
          case "students":
            orderByClause = sql`(
              SELECT COUNT(*)
              FROM ${purchases}
              WHERE ${purchases.courseId} = ${courses.id}
              AND ${purchases.paymentStatus} = 'completed'
            ) ${direction === "asc" ? sql`ASC` : sql`DESC`}`;
            break;
          default:
            orderByClause = asc(courses.createdAt);
        }
      } catch (error) {
        console.log("Error parsing orderByParam", error);
        orderByClause = asc(courses.createdAt);
      }
    } else {
      orderByClause = asc(courses.createdAt);
    }

    const [coursesList, total] = await Promise.all([
      db
        .select({
          id: courses.id,
          title: courses.title,
          slug: courses.slug,
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
              FROM ${purchases}
              WHERE ${purchases.courseId} = ${courses.id}
              AND ${purchases.paymentStatus} = 'completed'
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
        .orderBy(orderByClause),
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
        slug: data.slug,
        description: data.description,
        categoryId: data.categoryId,
        price: Number(data.price),
        isActive: data.isActive,
        whatsappGroupId: data.whatsappGroupId,
        thumbnail: data.thumbnail,
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
      .set({
        ...courseData,
        price: Number(courseData.price),
      })
      .where(eq(courses.id, id))
      .returning();

    // Eliminar módulos existentes (las clases se eliminarán en cascada)
    await db.delete(modules).where(eq(modules.courseId, id));

    // Crear los nuevos módulos y sus clases
    const createdModules = await Promise.all(
      newModules.map(
        async (moduleData: CreateCourseData["modules"][0], index: number) => {
          // Crear módulo
          const [createdModule] = await db
            .insert(modules)
            .values({
              title: moduleData.title,
              courseId: id,
              order: moduleData.order ?? index,
            })
            .returning();

          // Crear clases del módulo
          const createdClasses = moduleData.classes?.length
            ? await db
                .insert(moduleClasses)
                .values(
                  moduleData.classes.map((classData, classIndex) => ({
                    moduleId: createdModule.id,
                    classId: classData.classId,
                    order: classData.order ?? classIndex,
                  }))
                )
                .returning()
            : [];

          return {
            ...createdModule,
            classes: createdClasses,
          };
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
