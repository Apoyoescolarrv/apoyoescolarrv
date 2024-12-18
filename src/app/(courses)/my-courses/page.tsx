"use client";

import { usePurchasedCoursesQuery } from "@/api/purchases/query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration } from "@/lib/format";
import { Course } from "@/types/course";
import { Clock, GraduationCap, Play, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function MyCoursesPage() {
  const { data: courses = [] } = usePurchasedCoursesQuery();

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: Course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="relative aspect-video">
              {course.thumbnail && (
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="lg">
                  <Play className="h-6 w-6 mr-2" />
                  Continuar
                </Button>
              </div>
            </div>

            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progreso</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(course.totalDuration ?? 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>{course._count?.modules ?? 0} módulos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{course._count?.students ?? 0} estudiantes</span>
                </div>
              </div>

              <Link href={`/courses/${course.id}/learn`} className="block mt-4">
                <Button className="w-full">Ir al curso</Button>
              </Link>
            </CardContent>
          </Card>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No tienes cursos todavía
            </h3>
            <p className="text-muted-foreground mb-4">
              Explora nuestro catálogo y comienza tu aprendizaje
            </p>
            <Link href="/courses">
              <Button>Ver cursos disponibles</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
