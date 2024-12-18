import { useQuery } from "@tanstack/react-query";
import { CartService } from "./service";

export const useCartQuery = () => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: CartService.getCart,
  });
};
