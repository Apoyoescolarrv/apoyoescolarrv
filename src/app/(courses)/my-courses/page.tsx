"use client";

import { usePurchasedCoursesQuery } from "@/api/purchases/query";
import { CoursesListSkeleton } from "@/components/courses/courses-list-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Course } from "@/types/course";
import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PurchasedCoursesPage() {
  const { data: courses = [], isLoading } = usePurchasedCoursesQuery();

  if (isLoading) {
    return <CoursesListSkeleton />;
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">
          No tienes cursos comprados
        </h2>
        <p className="text-muted-foreground mb-8">
          Explora nuestro catálogo y encuentra el curso perfecto para ti
        </p>
        <Link href="/courses">
          <Button>Ver cursos disponibles</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course: Course) => (
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
          </div>

          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">{course.title}</CardTitle>
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {course.description}
            </p>
          </CardHeader>

          <CardContent className="flex-1">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progreso</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </CardContent>

          <div className="p-6 pt-0">
            <Link href={`/my-courses/${course.slug}`}>
              <Button className="w-full gap-2">
                <Play className="h-4 w-4" />
                Continuar
              </Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
