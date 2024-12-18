"use client";

import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";

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
  const { addItem, removeItem, isInCart } = useCart();
  const isInTheCart = isInCart(course.id);

  return (
    <Button
      className={cn("gap-2", className)}
      variant={isInTheCart ? "secondary" : variant}
      onClick={() => {
        if (isInTheCart) {
          removeItem(course.id);
        } else {
          addItem(course);
        }
      }}
    >
      <ShoppingCart className="h-4 w-4" />
      {isInTheCart ? "Quitar del carrito" : "Añadir al carrito"}
    </Button>
  );
}
