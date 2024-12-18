import { http } from "@/lib/http";
import { Course } from "@/types/course";

interface PurchasedCoursesResponse {
  data: Course[];
}

interface CheckoutResponse {
  message: string;
  data: Course[];
}

export class PurchaseService {
  static async purchaseCourses(courseIds: string[]): Promise<Course[]> {
    const { data } = await http.post<CheckoutResponse>("/cart/checkout", {
      courseIds,
    });
    return data.data;
  }

  static async getUserCourses(): Promise<Course[]> {
    const { data } = await http.get<PurchasedCoursesResponse>("/purchases");
    return data.data;
  }
}
