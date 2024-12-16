import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoriesService } from "./service";

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CategoriesService.createCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["categories"],
        exact: false,
      });
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CategoriesService.updateCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["categories"],
        exact: false,
      });
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CategoriesService.deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["categories"],
        exact: false,
      });
    },
  });
};
