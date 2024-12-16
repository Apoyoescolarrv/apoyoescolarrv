export type Filter<TColumns> = {
  field: keyof TColumns;
  operator: "eq" | "neq" | "isNull" | "isNotNull" | "like";
  value?: string | number | boolean;
};
