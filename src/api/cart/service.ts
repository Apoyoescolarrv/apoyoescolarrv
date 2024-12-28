import { http } from "@/lib/http";
import { Course } from "@/types/course";

interface CartResponse {
  data: Course[];
}

interface CartItemResponse {
  message: string;
  data: Course;
}

export class CartService {
  static async getCart(): Promise<Course[]> {
    const { data } = await http.get<CartResponse>("/cart");
    return data.data;
  }

  static async addToCart(slug: string): Promise<Course> {
    const { data } = await http.post<CartItemResponse>("/cart", { slug });
    return data.data;
  }

  static async removeFromCart(slug: string): Promise<void> {
    await http.delete(`/cart/${slug}`);
  }

  static async clearCart(): Promise<void> {
    await http.delete("/cart");
  }
}
