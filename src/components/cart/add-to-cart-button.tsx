"use client";

import {
  useAddToCartMutation,
  useRemoveFromCartMutation,
} from "@/api/cart/mutations";
import { useCartQuery } from "@/api/cart/query";
import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type AddToCartButtonProps = {
  course: Course;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
};

export function AddToCartButton({
  course,
  className,
  variant = "default",
}: AddToCartButtonProps) {
  const { data: cartItems = [] } = useCartQuery();
  const { mutateAsync: addToCart, isPending: isAddingToCart } =
    useAddToCartMutation();
  const { mutateAsync: removeFromCart, isPending: isRemovingFromCart } =
    useRemoveFromCartMutation();
  const { toast } = useToast();

  const isInCart = cartItems.some((item) => item.id === course.id);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      if (isInCart) {
        await removeFromCart(course.slug);
        toast({
          title: "Curso eliminado del carrito",
        });
      } else {
        await addToCart(course.slug);
        toast({
          title: "Curso añadido al carrito",
        });
      }
    } catch {
      toast({
        title: isInCart
          ? "Error al eliminar del carrito"
          : "Error al añadir al carrito",
        description: "Por favor, intenta nuevamente",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      className={cn("gap-2 min-w-fit", className)}
      variant={isInCart ? "secondary" : variant}
      onClick={handleClick}
      isLoading={isAddingToCart || isRemovingFromCart}
    >
      <ShoppingCart className="h-4 w-4" />
      {isInCart ? "Quitar del carrito" : "Añadir al carrito"}
    </Button>
  );
}
