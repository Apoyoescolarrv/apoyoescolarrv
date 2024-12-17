"use client";

import { CourseCreationStepper } from "@/components/admin/courses/course-creation-stepper";
import { useCourseQuery } from "@/api/courses/query";
import { Skeleton } from "@/components/ui/skeleton";
import { use } from "react";

interface EditCoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = use(params);
  const { data: course, isLoading } = useCourseQuery(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!course) {
    return <div>No se encontró el curso</div>;
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Editar Curso</h1>
      <CourseCreationStepper isEditing courseId={id} defaultValues={course} />
    </div>
  );
}
