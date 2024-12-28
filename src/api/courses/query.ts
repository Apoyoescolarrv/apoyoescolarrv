import { useQuery } from "@tanstack/react-query";
import { CoursesService, CourseOrderByField } from "./service";
import { Filter } from "@/types/filters";
import { courses } from "@/db/schema";

interface CoursesQueryParams {
  page?: number;
  search?: string;
  filters?: Filter<(typeof courses._)["columns"]>[];
  orderBy?: {
    field: CourseOrderByField;
    direction: "asc" | "desc";
  };
}

export const useCoursesQuery = ({
  page = 1,
  search = "",
  filters = [],
  orderBy,
}: CoursesQueryParams = {}) => {
  return useQuery({
    queryKey: ["courses", page, search, filters, orderBy],
    queryFn: () =>
      CoursesService.getCourses(page, 10, search, filters, orderBy),
  });
};

export const useCourseQuery = (slug: string) => {
  return useQuery({
    queryKey: ["course", slug],
    queryFn: () => CoursesService.getCourse(slug),
  });
};
