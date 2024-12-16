import { useQuery } from "@tanstack/react-query";
import { CategoriesService } from "./service";

interface CategoriesQueryParams {
  page?: number;
  search?: string;
}

export const useCategoriesQuery = ({
  page = 1,
  search = "",
}: CategoriesQueryParams = {}) => {
  return useQuery({
    queryKey: ["categories", page, search],
    queryFn: () => CategoriesService.getCategories(page, 10, search),
  });
};
