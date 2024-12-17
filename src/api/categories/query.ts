import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { CategoriesService } from "./service";
import { Filter } from "@/types/filters";
import { categories } from "@/db/schema";

interface CategoriesQueryParams {
  page?: number;
  search?: string;
  filters?: Filter<(typeof categories._)["columns"]>[];
}

// Query tradicional con paginación para la vista de categorías
export const useCategoriesQuery = ({
  page = 1,
  search = "",
}: CategoriesQueryParams = {}) => {
  return useQuery({
    queryKey: ["categories", page, search],
    queryFn: () => CategoriesService.getCategories(page, 10, search),
  });
};

// Query con scroll infinito para el selector de categorías
export const useInfiniteCategoriesQuery = ({
  search = "",
}: Omit<CategoriesQueryParams, "page"> = {}) => {
  return useInfiniteQuery({
    queryKey: ["infiniteCategories", search],
    queryFn: ({ pageParam = 1 }) =>
      CategoriesService.getCategories(pageParam, 10, search),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.currentPage < lastPage.pagination.totalPages
        ? lastPage.pagination.currentPage + 1
        : undefined,
    initialPageParam: 1,
  });
};
