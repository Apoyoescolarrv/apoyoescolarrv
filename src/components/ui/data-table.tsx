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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ListFilter as FilterIcon,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Skeleton } from "./skeleton";

export interface TableFilter<TValue = string> {
  id: string;
  label: string;
  value: TValue;
  type?: "select" | "buttons";
  options: {
    label: string;
    value: TValue;
    icon?: React.ReactNode;
  }[];
  onValueChange: (value: TValue) => void;
}

interface DataTableProps<TData, TValue, TFilterValue = string> {
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
  onSearch?: (value: string) => void;
  searchValue?: string;
  actions?: {
    onEdit?: (row: TData) => void;
    onDelete?: (row: TData) => void;
  };
  filters?: TableFilter<TFilterValue>[];
  activeFiltersCount?: number;
}

export function DataTable<TData, TValue, TFilterValue = string>({
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
  onSearch,
  searchValue,
  actions,
  filters,
  activeFiltersCount = 0,
}: DataTableProps<TData, TValue, TFilterValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [localSearch, setLocalSearch] = useState("");

  const shouldUseLocalSearch = !manualPagination || pageCount <= 1;

  const handleSearch = (value: string) => {
    setLocalSearch(value);
    if (!shouldUseLocalSearch) {
      onSearch?.(value);
    } else if (searchableColumn) {
      table.getColumn(searchableColumn)?.setFilterValue(value);
    }
  };

  const columns = useMemo(() => {
    let cols = initialColumns;

    if (selectable) {
      cols = [
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
        ...cols,
      ];
    }

    if (actions?.onEdit || actions?.onDelete) {
      cols = [
        ...cols,
        {
          id: "actions",
          header: () => <div className="text-center">Acciones</div>,
          cell: ({ row }) => (
            <div className="flex justify-center text-center gap-2">
              {actions.onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => actions.onEdit?.(row.original)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {actions.onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => actions.onDelete?.(row.original)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ),
        },
      ];
    }

    return cols;
  }, [initialColumns, selectable, actions]);

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

  const renderFilterContent = (filter: TableFilter<TFilterValue>) => {
    if (filter.type === "select") {
      return (
        <Select
          value={String(filter.value)}
          onValueChange={(value) => filter.onValueChange(value as TFilterValue)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar opción" />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem
                key={`${filter.id}-${String(option.value)}`}
                value={String(option.value)}
                className="flex items-center gap-2"
              >
                {option.icon}
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2">
        {filter.options.map((option) => (
          <Button
            key={`${filter.id}-${String(option.value)}`}
            variant={filter.value === option.value ? "default" : "outline"}
            size="sm"
            className="justify-start"
            onClick={() => filter.onValueChange(option.value)}
          >
            {option.icon}
            {option.label}
            {filter.value === option.value && (
              <Check className="ml-2 h-4 w-4" />
            )}
          </Button>
        ))}
      </div>
    );
  };

  const renderFilters = () => {
    if (!filters?.length) return null;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            <FilterIcon className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="rounded-full size-5 flex items-center justify-center px-1 font-normal"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-4" align="start">
          <div className="space-y-4">
            {filters.map((filter, index) => (
              <div key={filter.id} className="space-y-2">
                <div className="font-medium text-sm">{filter.label}</div>
                <div className="space-y-2">{renderFilterContent(filter)}</div>
                {index < filters.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div>
      {(searchableColumn || filters?.length) && (
        <div className="flex items-center gap-4 justify-between py-4">
          <div className="flex items-center w-full max-w-sm gap-2">
            {searchableColumn && (
              <Input
                placeholder={searchPlaceholder}
                value={shouldUseLocalSearch ? localSearch : searchValue ?? ""}
                onChange={(event) => handleSearch(event.target.value)}
                disabled={isLoading}
                clearable
              />
            )}
            {renderFilters()}
          </div>
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
