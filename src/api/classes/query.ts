import { useQuery } from "@tanstack/react-query";
import { ClassesService } from "./service";

interface ClassesQueryParams {
  page?: number;
  search?: string;
}

export const useClassesQuery = ({
  page = 1,
  search = "",
}: ClassesQueryParams = {}) => {
  return useQuery({
    queryKey: ["classes", page, search],
    queryFn: () => ClassesService.getClasses(page, 10, search),
  });
};

export const useClassQuery = (id: string) => {
  return useQuery({
    queryKey: ["class", id],
    queryFn: () => ClassesService.getClass(id),
  });
};
