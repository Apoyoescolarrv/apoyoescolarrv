"use client";

import {
  useClearCartMutation,
  useRemoveFromCartMutation,
} from "@/api/cart/mutations";
import { useCartQuery } from "@/api/cart/query";
import { usePurchaseCourseMutation } from "@/api/purchases/mutations";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/format";
import { ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function CartNav() {
  const { data: cartItems = [] } = useCartQuery();
  const { mutateAsync: clearCart } = useClearCartMutation();
  const { mutateAsync: removeFromCart } = useRemoveFromCartMutation();
  const { mutateAsync: purchaseCourses, isPending: isPurchasing } =
    usePurchaseCourseMutation();
  const { toast } = useToast();
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      const slugs = cartItems.map((item) => item.slug);
      await purchaseCourses(slugs);
      await clearCart();
      toast({
        title: "¡Compra realizada con éxito!",
        description: "Tus cursos están disponibles en 'Mis cursos'",
      });
      router.push("/my-courses");
    } catch {
      toast({
        title: "Error al procesar la compra",
        description: "Por favor, intenta nuevamente",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (slug: string) => {
    try {
      await removeFromCart(slug);
      toast({
        title: "Curso eliminado del carrito",
      });
    } catch {
      toast({
        title: "Error al eliminar el curso",
        description: "Por favor, intenta nuevamente",
        variant: "destructive",
      });
    }
  };

  const total = cartItems.reduce((acc, item) => acc + (item.price ?? 0), 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:text-black transition-colors"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartItems.length > 0 && (
            <span className="absolute bg-yellowrv text-black -top-2 -right-2 rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Carrito de compras</SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border-b pb-4"
            >
              <div className="relative w-20 h-20">
                {item.thumbnail && (
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    width={80}
                    height={80}
                    className="object-cover rounded-md"
                  />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{item.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(item.price ?? 0)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveItem(item.slug)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {cartItems.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Tu carrito está vacío</p>
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <Button
                className="w-full"
                onClick={handleCheckout}
                isLoading={isPurchasing}
              >
                Finalizar compra
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
