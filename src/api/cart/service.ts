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

  static async addToCart(courseId: string): Promise<Course> {
    const { data } = await http.post<CartItemResponse>("/cart", { courseId });
    return data.data;
  }

  static async removeFromCart(courseId: string): Promise<void> {
    await http.delete(`/cart/${courseId}`);
  }

  static async clearCart(): Promise<void> {
    await http.delete("/cart");
  }
}
