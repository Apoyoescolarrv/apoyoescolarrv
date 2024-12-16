import { Filter } from "@/types/filters";
import { SQL, and, eq, ilike, isNotNull, isNull, ne } from "drizzle-orm";
import { PgColumn, PgTable } from "drizzle-orm/pg-core";

export const buildWhereClause = <T extends PgTable>(
  table: T,
  filters: Filter<T["_"]["columns"]>[]
): SQL | undefined => {
  const conditions: SQL[] = [];

  filters.forEach((filter) => {
    const column = (table as Record<keyof T["_"]["columns"], PgColumn>)[
      filter.field
    ];

    switch (filter.operator) {
      case "eq":
        if (filter.value !== undefined) {
          conditions.push(eq(column, filter.value));
        }
        break;
      case "neq":
        if (filter.value !== undefined) {
          conditions.push(ne(column, filter.value));
        }
        break;
      case "isNull":
        conditions.push(isNull(column));
        break;
      case "isNotNull":
        conditions.push(isNotNull(column));
        break;
      case "like":
        if (typeof filter.value === "string") {
          conditions.push(ilike(column, `%${filter.value}%`));
        }
        break;
    }
  });

  return conditions.length > 0 ? and(...conditions) : undefined;
};
