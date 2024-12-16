import { http } from "@/lib/http";
import { CategoriesResponse, CategoryResponse } from "@/types/category";

export const CategoriesService = {
  getCategories: async (page = 1, limit = 10, search?: string) => {
    const { data } = await http.get<CategoriesResponse>(
      `/categories?page=${page}&limit=${limit}${
        search ? `&search=${search}` : ""
      }`
    );
    return data;
  },

  createCategory: async ({
    name,
    parentId,
  }: {
    name: string;
    parentId?: string;
  }) => {
    const { data } = await http.post<CategoryResponse>("/categories", {
      name,
      parentId,
    });
    return data.category;
  },

  updateCategory: async ({
    id,
    name,
    parentId,
  }: {
    id: string;
    name: string;
    parentId?: string;
  }) => {
    const { data } = await http.put<CategoryResponse>(`/categories`, {
      id,
      name,
      parentId,
    });
    return data.category;
  },

  deleteCategory: async (id: string) => {
    const { data } = await http.delete<CategoryResponse>(
      `/categories?id=${id}`
    );
    return data.category;
  },
};
