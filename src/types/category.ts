export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  parentName: string | null;
  createdAt: string;
}

export interface CategoriesResponse {
  data: Category[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

export interface CategoryResponse {
  category: Category;
}
