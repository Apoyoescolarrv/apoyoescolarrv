import { useQuery } from "@tanstack/react-query";
import { CategoriesService } from "./service";

export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => await CategoriesService.getCategories(),
  });
};
