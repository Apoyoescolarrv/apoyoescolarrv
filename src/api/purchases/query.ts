import { useQuery } from "@tanstack/react-query";
import { PurchaseService } from "./service";

export const usePurchasedCoursesQuery = () => {
  return useQuery({
    queryKey: ["purchased-courses"],
    queryFn: PurchaseService.getUserCourses,
  });
};
