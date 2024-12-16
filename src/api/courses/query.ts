import { useQuery } from "@tanstack/react-query";
import { CoursesService } from "./service";

interface CoursesQueryParams {
  page?: number;
  search?: string;
}

export const useCoursesQuery = ({
  page = 1,
  search = "",
}: CoursesQueryParams = {}) => {
  return useQuery({
    queryKey: ["courses", page, search],
    queryFn: () => CoursesService.getCourses(page, 10, search),
  });
};
