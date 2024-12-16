import { useQuery } from "@tanstack/react-query";
import { CoursesService } from "./service";

export const useCoursesQuery = (page = 1) => {
  return useQuery({
    queryKey: ["courses", page],
    queryFn: () => CoursesService.getCourses(page),
  });
};
