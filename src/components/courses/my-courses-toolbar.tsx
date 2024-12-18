import { BaseToolbarProps, CategoryFilterProps } from "./toolbar-types";
import {
  CategoryMenu,
  FilterBadges,
  SearchBar,
  SortMenu,
} from "./toolbar-components";

const availableSortOptions = [
  "title-asc",
  "title-desc",
  "progress-asc",
  "progress-desc",
  "lastAccessed-desc",
] as const;

type MyCoursesToolbarProps = BaseToolbarProps & CategoryFilterProps;

export function MyCoursesToolbar({
  search,
  onSearchChange,
  selectedCategories,
  onCategoryToggle,
  sortBy,
  onSortChange,
  categories,
}: MyCoursesToolbarProps) {
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
