import { Filter } from "@/types/filters";

export const parseFilters = <TColumns>(
  searchParams: URLSearchParams
): Filter<TColumns>[] => {
  const filtersParam = searchParams.get("filters");
  if (!filtersParam) return [];

  try {
    return JSON.parse(filtersParam);
  } catch {
    return [];
  }
};
