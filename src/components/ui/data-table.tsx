"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useMemo, useState } from "react";
import { Input } from "./input";
import { Checkbox } from "./checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "./skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  selectable?: boolean;
  searchableColumn?: string;
  searchPlaceholder?: string;
  onRowSelection?: (selectedRows: TData[]) => void;
  pageSize?: number;
  topBar?: React.ReactNode;
  isLoading?: boolean;
  manualPagination?: boolean;
  pageCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<TData, TValue>({
  columns: initialColumns,
  data,
  selectable = true,
  searchableColumn,
  searchPlaceholder = "Buscar...",
  topBar,
  onRowSelection,
  pageSize = 10,
  isLoading = false,
  manualPagination = false,
  pageCount = 0,
  currentPage = 1,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns = useMemo(() => {
    return selectable
      ? [
          {
            id: "select",
            header: ({ table }) => (
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
              />
            ),
            cell: ({ row }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
            ),
            enableSorting: false,
            enableHiding: false,
          },
          ...initialColumns,
        ]
      : initialColumns;
  }, [initialColumns, selectable]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      columnVisibility,
      pagination: manualPagination
        ? {
            pageIndex: currentPage - 1,
            pageSize,
          }
        : undefined,
    },
    onPaginationChange: manualPagination
      ? (updater) => {
          if (typeof updater === "function") {
            const newState = updater({
              pageIndex: currentPage - 1,
              pageSize,
            });
            onPageChange?.(newState.pageIndex + 1);
          }
        }
      : undefined,
  });

  useEffect(() => {
    if (onRowSelection && selectable) {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      onRowSelection(selectedRows);
    }
  }, [rowSelection, onRowSelection, selectable, table]);

  return (
    <div>
      {searchableColumn && (
        <div className="flex items-end justify-between py-4">
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchableColumn)?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn(searchableColumn)
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            disabled={isLoading}
          />
          {topBar}
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {selectable &&
            `${table.getFilteredSelectedRowModel().rows.length} de ${
              table.getFilteredRowModel().rows.length
            } fila(s) seleccionada(s).`}
        </div>
        <div className="space-x-2">
          {manualPagination && pageCount > 0 && (
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {pageCount}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              manualPagination
                ? onPageChange?.(currentPage - 1)
                : table.previousPage()
            }
            disabled={
              (manualPagination
                ? currentPage <= 1
                : !table.getCanPreviousPage()) || isLoading
            }
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              manualPagination
                ? onPageChange?.(currentPage + 1)
                : table.nextPage()
            }
            disabled={
              (manualPagination
                ? currentPage >= pageCount
                : !table.getCanNextPage()) || isLoading
            }
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
