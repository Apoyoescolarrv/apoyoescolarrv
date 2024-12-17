import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { ClassesService } from "./service";

interface ClassesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useClassesQuery = ({
  page = 1,
  limit = 10,
  search = "",
}: ClassesQueryParams = {}) => {
  return useQuery({
    queryKey: ["classes", { page, limit, search }],
    queryFn: () => ClassesService.getClasses(page, limit, search),
  });
};

export const useClassQuery = (id: string | null) => {
  return useQuery({
    queryKey: ["class", id],
    queryFn: () => (id ? ClassesService.getClass(id) : null),
    enabled: !!id,
  });
};

export const useInfiniteClassesQuery = ({
  limit = 10,
  search = "",
}: Omit<ClassesQueryParams, "page"> = {}) => {
  return useInfiniteQuery({
    queryKey: ["infiniteClasses", { limit, search }],
    queryFn: ({ pageParam = 1 }) =>
      ClassesService.getClasses(pageParam, limit, search),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return nextPage <= lastPage.pagination.totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
  });
};
