import { BaseToolbarProps, CategoryFilterProps } from "./toolbar-types";
import {
  CategoryMenu,
  FilterBadges,
  SearchBar,
  SortMenu,
} from "./toolbar-components";

const availableSortOptions = [
  "price-asc",
  "price-desc",
  "title-asc",
  "title-desc",
  "students-desc",
] as const;

type CoursesToolbarProps = BaseToolbarProps & CategoryFilterProps;

export function CoursesToolbar({
  search,
  onSearchChange,
  selectedCategories,
  onCategoryToggle,
  sortBy,
  onSortChange,
  categories,
}: CoursesToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <SearchBar value={search} onChange={onSearchChange} />
        <SortMenu
          value={sortBy}
          onChange={onSortChange}
          options={availableSortOptions}
        />
        <CategoryMenu
          categories={categories}
          selectedCategories={selectedCategories}
          onToggle={onCategoryToggle}
        />
      </div>

      <FilterBadges
        selectedCategories={selectedCategories}
        categories={categories}
        onCategoryToggle={onCategoryToggle}
        onClearAll={() => onCategoryToggle("")}
      />
    </div>
  );
}
