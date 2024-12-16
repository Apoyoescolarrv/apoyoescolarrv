import { PaginationParams } from "@/types/pagination";
import { SQL, ilike, sql } from "drizzle-orm";
import { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { NextRequest, NextResponse } from "next/server";

export interface SearchConfig {
  searchField: string;
  transliterateSearch?: boolean;
}

export interface EndpointConfig {
  errorMessage?: string;
  pagination?: boolean;
  search?: SearchConfig;
}

export const getPaginationParams = (
  searchParams: URLSearchParams
): PaginationParams => {
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

export const getSearchQuery = (
  searchParams: URLSearchParams,
  table: PgTable,
  searchConfig: SearchConfig
): SQL | undefined => {
  const search = searchParams.get("search");
  if (!search) return undefined;

  const column = table[
    searchConfig.searchField as keyof typeof table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as PgColumn<any>;

  const normalizedSearch = search
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (searchConfig.transliterateSearch) {
    return ilike(
      sql`TRANSLATE(LOWER(${column}), 'áéíóúüñ', 'aeiouun')`,
      `%${normalizedSearch}%`
    );
  }

  return ilike(column, `%${search}%`);
};

export const buildEndpoint = (
  handler: (
    req: NextRequest,
    config?: EndpointConfig
  ) => Promise<NextResponse> | NextResponse,
  config: EndpointConfig = {
    errorMessage: "Ocurrió un error al procesar la solicitud",
  }
) => {
  return async (req: NextRequest) => {
    try {
      return await handler(req, config);
    } catch (error) {
      console.error(`${config.errorMessage || "An error occurred"} |`, error);
      return NextResponse.json(
        { error: config.errorMessage, details: String(error) },
        { status: 500 }
      );
    }
  };
};
