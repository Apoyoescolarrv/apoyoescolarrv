import { useQuery } from "@tanstack/react-query";
import { CategoriesService } from "./service";
import { Filter } from "@/types/filters";
import { categories } from "@/db/schema";

interface CategoriesQueryParams {
  page?: number;
  search?: string;
  filters?: Filter<(typeof categories._)["columns"]>[];
}

export const useCategoriesQuery = ({
  page = 1,
  search = "",
  filters = [],
}: CategoriesQueryParams = {}) => {
  return useQuery({
    queryKey: ["categories", page, search, filters],
    queryFn: () => CategoriesService.getCategories(page, 10, search, filters),
  });
};
