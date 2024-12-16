import { useQuery } from "@tanstack/react-query";
import { CategoriesService } from "./service";

export const useCategoriesQuery = (page = 1) => {
  return useQuery({
    queryKey: ["categories", page],
    queryFn: () => CategoriesService.getCategories(page),
  });
};
