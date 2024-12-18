export type FilterOperator =
  | "eq"
  | "neq"
  | "isNull"
  | "isNotNull"
  | "like"
  | "between";

export type FilterValue<O extends FilterOperator> = O extends "between"
  ? [number, number]
  : O extends "isNull" | "isNotNull"
  ? never
  : string | number | boolean;

export type Filter<T> = {
  field: keyof T;
  operator: FilterOperator;
  value: FilterValue<FilterOperator>;
};
