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
import { formatCurrency } from "@/lib/format";
import { Course } from "@/types/course";
import Image from "next/image";
import Link from "next/link";

export function CoursesList() {
  const { data } = useCoursesQuery({
    page: 1,
    filters: [{ field: "isActive", operator: "eq", value: true }],
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data?.data?.map((course: Course) => (
        <Card
          key={course.id}
          className="group flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300"
        >
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={course.thumbnail || "/images/course-placeholder.jpg"}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {course.categoryName && (
              <Badge variant="secondary" className="absolute top-4 left-4 z-10">
                {course.categoryName}
              </Badge>
            )}
            <Badge className="absolute top-4 right-4 z-10 bg-black/75 hover:bg-black/85">
              {formatCurrency(course.price)}
            </Badge>
          </div>

          <CardHeader className="space-y-2">
            <h2 className="text-xl font-semibold leading-none line-clamp-2">
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
                <span>8 horas</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span>6 módulos</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>120 estudiantes</span>
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
      ))}
    </div>
  );
}
