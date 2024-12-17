import { useQuery } from "@tanstack/react-query";
import { CoursesService } from "./service";
import { Filter } from "@/types/filters";
import { courses } from "@/db/schema";

interface CoursesQueryParams {
  page?: number;
  search?: string;
  filters?: Filter<(typeof courses._)["columns"]>[];
}

export const useCoursesQuery = ({
  page = 1,
  search = "",
  filters = [],
}: CoursesQueryParams = {}) => {
  return useQuery({
    queryKey: ["courses", page, search, filters],
    queryFn: () => CoursesService.getCourses(page, 10, search, filters),
  });
};

export const useCourseQuery = (id: string) => {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => CoursesService.getCourse(id),
  });
};
