import { useQuery } from "@tanstack/react-query";
import { CoursesService } from "./service";

export const useCoursesQuery = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => await CoursesService.getCourses(),
  });
};
