"use client";

import { useCoursesQuery } from "@/api/courses/query";
import { usePurchasedCoursesQuery } from "@/api/purchases/query";
import CourseCard from "@/components/courses/course-card";
import { CoursesListSkeleton } from "@/components/courses/courses-list-skeleton";
import { CoursesToolbar } from "@/components/courses/courses-toolbar";
import { useDebounce } from "@/hooks/use-debounce";
import { Course } from "@/types/course";
import { SortOption } from "@/types/sort";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { useCategoriesQuery } from "@/api/categories/query";

export function CoursesList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("students-desc");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Infinity]);

  const { data: categoriesData } = useCategoriesQuery();
  const categories = categoriesData?.data || [];

  const { data, isLoading } = useCoursesQuery({
    page: 1,
    filters: [
      { field: "isActive" as const, operator: "eq" as const, value: true },
      ...selectedCategories.map((category) => ({
        field: "categoryId" as const,
        operator: "eq" as const,
        value: category,
      })),
      ...(priceRange[0] > 0 || priceRange[1] < Infinity
        ? [
            {
              field: "price" as const,
              operator: "between" as const,
              value: [priceRange[0], priceRange[1]] as [number, number],
            },
          ]
        : []),
    ],
    search: debouncedSearch,
    orderBy: {
      field: sortBy.split("-")[0] as "price" | "title" | "students",
      direction: sortBy.endsWith("-desc") ? "desc" : "asc",
    },
  });

  const { data: purchasedCourses = [] } = usePurchasedCoursesQuery();

  const isCoursePurchased = useCallback(
    (courseId: string) => {
      return purchasedCourses.some((c) => c.id === courseId);
    },
    [purchasedCourses]
  );

  const handleCategoryToggle = (categoryId: string) => {
    if (categoryId === "") {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="space-y-6">
      <CoursesToolbar
        search={search}
        onSearchChange={setSearch}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
      />

      {isLoading ? (
        <CoursesListSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data.map((course: Course) => (
              <CourseCard
                key={course.id}
                course={course}
                categoryName={course.category?.name}
                isOwned={isCoursePurchased(course.id)}
              />
            ))}
          </div>

          {(!data?.data || data.data.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No se encontraron cursos que coincidan con los filtros
                seleccionados
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setSearch("");
                  setSelectedCategories([]);
                  setPriceRange([0, Infinity]);
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
