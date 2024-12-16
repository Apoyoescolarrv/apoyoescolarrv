import { http } from "@/lib/http";
import { Category } from "@/types/category";
import { Filter } from "@/types/filters";

import { categories } from "@/db/schema";
import { PaginatedResponse } from "@/types/pagination";

export class CategoriesService {
  static async getCategories(
    page: number,
    limit: number,
    search: string,
    filters: Filter<(typeof categories._)["columns"]>[] = []
  ): Promise<PaginatedResponse<Category>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    if (filters.length > 0) {
      params.append("filters", JSON.stringify(filters));
    }

    const { data } = await http.get<PaginatedResponse<Category>>(
      `/categories?${params}`
    );
    return data;
  }

  static async createCategory({
    name,
    parentId,
  }: {
    name: string;
    parentId: string | null;
  }) {
    const { data } = await http.post<{ category: Category }>("/categories", {
      name,
      parentId,
    });
    return data.category;
  }

  static async updateCategory({
    id,
    name,
    parentId,
  }: {
    id: string;
    name: string;
    parentId: string | null;
  }) {
    const { data } = await http.put<{ category: Category }>(`/categories`, {
      id,
      name,
      parentId,
    });
    return data.category;
  }

  static async deleteCategory(id: string) {
    const { data } = await http.delete<{ category: Category }>(
      `/categories?id=${id}`
    );
    return data.category;
  }
}
