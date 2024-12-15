import { http } from "@/lib/http";
import { CategoriesResponse, CategoryResponse } from "@/types/category";

export const getCategories = async (page = 1, limit = 10) => {
  const { data } = await http.get<CategoriesResponse>(
    `/categories?page=${page}&limit=${limit}`
  );
  return data;
};

export const createCategory = async ({
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
  return data;
};

export const updateCategory = async ({
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
  return data;
};

export const deleteCategory = async (id: string) => {
  const { data } = await http.delete<CategoryResponse>(`/categories?id=${id}`);
  return data;
};
