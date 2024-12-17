import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
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

export const useInfiniteClassesQuery = ({
  search = "",
}: ClassesQueryParams = {}) => {
  return useInfiniteQuery({
    queryKey: ["infiniteClasses", search],
    queryFn: ({ pageParam = 1 }) =>
      ClassesService.getClasses(pageParam, 10, search),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.totalPages > lastPage.pagination.total / 10
        ? Math.floor(lastPage.pagination.total / 10) + 1
        : undefined,
    initialPageParam: 1,
  });
};
