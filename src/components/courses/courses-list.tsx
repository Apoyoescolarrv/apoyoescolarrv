"use client";

import { useCoursesQuery } from "@/api/courses/query";
import { usePurchasedCoursesQuery } from "@/api/purchases/query";
import { CoursesListSkeleton } from "@/components/courses/courses-list-skeleton";
import CourseCard from "@/components/courses/course-card";
import { Course } from "@/types/course";

export function CoursesList() {
  const { data, isLoading } = useCoursesQuery({
    page: 1,
    filters: [{ field: "isActive", operator: "eq", value: true }],
  });
  const { data: purchasedCourses = [] } = usePurchasedCoursesQuery();

  const isCoursePurchased = (courseId: string) => {
    return purchasedCourses.some((c) => c.id === courseId);
  };

  if (isLoading) {
    return <CoursesListSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data?.data?.map((course: Course) => (
        <CourseCard
          key={course.id}
          course={course}
          categoryName={course.category?.name}
          isOwned={isCoursePurchased(course.id)}
        />
      ))}
    </div>
  );
}
