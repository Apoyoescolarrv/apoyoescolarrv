"use client";

import { useCoursesQuery } from "@/api/courses/query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Clock, GraduationCap, Users } from "lucide-react";
import { formatCurrency, formatDuration } from "@/lib/format";
import { Course } from "@/types/course";
import Image from "next/image";
import Link from "next/link";

export function CoursesList() {
  const { data, isLoading } = useCoursesQuery({
    page: 1,
    filters: [{ field: "isActive", operator: "eq", value: true }],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="flex flex-col overflow-hidden">
            <div className="relative aspect-video bg-muted animate-pulse" />
            <CardHeader className="space-y-2">
              <div className="h-6 w-2/3 bg-muted animate-pulse rounded" />
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-4 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="grid grid-cols-2 gap-4 w-full pt-4">
                <div className="h-10 bg-muted animate-pulse rounded" />
                <div className="h-10 bg-muted animate-pulse rounded" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data?.data?.map((course: Course) => {
        const categoryName = course.category?.name;
        return (
          <Card
            key={course.id}
            className="group flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="relative aspect-video overflow-hidden">
              {course.thumbnail && (
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              {categoryName && (
                <Badge
                  variant="secondary"
                  className="absolute top-4 left-4 z-10"
                >
                  {categoryName}
                </Badge>
              )}
              <Badge className="absolute top-4 right-4 z-10 bg-black/75 hover:bg-black/85">
                {formatCurrency(course.price)}
              </Badge>
            </div>

            <CardHeader className="space-y-2">
              <h2 className="text-xl font-semibold leading-none">
                {course.title}
              </h2>
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {course.description}
              </p>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(course.totalDuration ?? 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>{course._count.modules} módulos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {course._count.students > 0
                      ? `${course._count.students} estudiantes`
                      : "Sé el primero"}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <div className="grid grid-cols-2 gap-4 w-full pt-4">
                <Link href={`/courses/${course.id}`}>
                  <Button className="w-full" variant="secondary">
                    Ver Detalles
                  </Button>
                </Link>
                <Link href={`/courses/${course.id}/buy`}>
                  <Button className="w-full">Comprar</Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
