"use client";

import { Course } from "@/types/course";
import { User } from "@/types/user";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type CartItem = {
  courseId: string;
  title: string;
  price: number;
  thumbnail?: string | null;
};

type CartContextType = {
  items: CartItem[];
  addItem: (course: Course) => void;
  removeItem: (courseId: string) => void;
  clearCart: () => void;
  isInCart: (courseId: string) => boolean;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function getCartKey(userId?: string) {
  return userId ? `cart_${userId}` : null;
}

function getCurrentUser(): User | null {
  try {
    const token = getCookie("token");
    if (!token) return null;
    return jwtDecode<User>(token as string);
  } catch {
    return null;
  }
}

export const LOGOUT_EVENT = "app:logout";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());

  useEffect(() => {
    const handleLogout = () => {
      setCurrentUser(null);
      setItems([]);
      const cartKey = getCartKey() || "cart";
      localStorage.removeItem(cartKey);
    };

    window.addEventListener(LOGOUT_EVENT, handleLogout);
    return () => window.removeEventListener(LOGOUT_EVENT, handleLogout);
  }, []);

  useEffect(() => {
    const cartKey = getCartKey(currentUser?.id) || "cart";
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch {
        setItems([]);
      }
    } else {
      setItems([]);
    }
  }, [currentUser]);

  useEffect(() => {
    const cartKey = getCartKey(currentUser?.id) || "cart";
    localStorage.setItem(cartKey, JSON.stringify(items));
  }, [items, currentUser]);

  const removeItem = useCallback((courseId: string) => {
    setItems((prev) => prev.filter((item) => item.courseId !== courseId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    const cartKey = getCartKey(currentUser?.id) || "cart";
    localStorage.removeItem(cartKey);
  }, [currentUser]);

  const isInCart = useCallback(
    (courseId: string) => {
      return items.some((item) => item.courseId === courseId);
    },
    [items]
  );

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  const addItem = useCallback(
    (course: Course) => {
      const user = getCurrentUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      if (user.id !== currentUser?.id) {
        setCurrentUser(user);
        return;
      }

      if (isInCart(course.id)) return;

      setItems((prev) => [
        ...prev,
        {
          courseId: course.id,
          title: course.title,
          price: course.price,
          thumbnail: course.thumbnail,
        },
      ]);
    },
    [currentUser, isInCart]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, isInCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
