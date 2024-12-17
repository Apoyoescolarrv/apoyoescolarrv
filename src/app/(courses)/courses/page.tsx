import { Suspense } from "react";
import { CoursesList } from "@/components/courses/courses-list";
import { CoursesListSkeleton } from "@/components/courses/courses-list-skeleton";

export default function CoursesPage() {
  return (
    <Suspense fallback={<CoursesListSkeleton />}>
      <CoursesList />
    </Suspense>
  );
}
