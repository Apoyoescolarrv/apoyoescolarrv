import { Dispatch, SetStateAction } from "react";
import { SortOption } from "@/types/sort";

export interface BaseToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  sortBy: SortOption;
  onSortChange: Dispatch<SetStateAction<SortOption>>;
}

export interface CategoryFilterProps {
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  categories: Array<{ id: string; name: string }>;
}

export interface PriceFilterProps {
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

export interface ProgressFilterProps {
  progressRange: [number, number];
  onProgressRangeChange: (range: [number, number]) => void;
}
