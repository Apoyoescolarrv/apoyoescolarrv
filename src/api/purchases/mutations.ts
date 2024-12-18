import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PurchaseService } from "./service";

export const usePurchaseCourseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: PurchaseService.purchaseCourses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchased-courses"] });
    },
  });
};
