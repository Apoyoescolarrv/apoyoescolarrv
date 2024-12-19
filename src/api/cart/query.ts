import { useQuery } from "@tanstack/react-query";
import { CartService } from "./service";

export const useCartQuery = () => {
  const hasToken =
    typeof window !== "undefined" && document.cookie.includes("token=");

  return useQuery({
    queryKey: ["cart"],
    queryFn: CartService.getCart,
    enabled: hasToken,
  });
};
