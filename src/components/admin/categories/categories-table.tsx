"use client";

import { useDeleteCategoryMutation } from "@/api/categories/mutations";
import { useCategoriesQuery } from "@/api/categories/query";
import { CategoryForm } from "@/components/admin/categories/category-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categories } from "@/db/schema";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { catchAxiosError } from "@/lib/catch-axios-error";
import { Category } from "@/types/category";
import { Filter } from "@/types/filters";
import { ColumnDef } from "@tanstack/react-table";
import { Filter as FilterIcon, Plus } from "lucide-react";
import { useMemo, useState } from "react";

interface CategoriesTableProps {
  onCategoryCreated?: () => void;
}

type FilterValue = "all" | "parent" | "no-parent";

export function CategoriesTable({ onCategoryCreated }: CategoriesTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const debouncedSearch = useDebounce(search);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();
  const [deletingCategory, setDeletingCategory] = useState<
    Category | undefined
  >();

  const filters = useMemo(() => {
    const tableFilters: Filter<(typeof categories._)["columns"]>[] = [];

    switch (filter) {
      case "parent":
        tableFilters.push({ field: "parentId", operator: "isNotNull" });
        break;
      case "no-parent":
        tableFilters.push({ field: "parentId", operator: "isNull" });
        break;
    }

    return tableFilters;
  }, [filter]);

  const { data, isLoading } = useCategoriesQuery({
    page,
    search: debouncedSearch,
    filters,
  });

  const { mutateAsync: deleteCategory, isPending: isDeleting } =
    useDeleteCategoryMutation();
  const { toast } = useToast();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategory(deletingCategory.id);
      toast({
        title: "Categoría eliminada",
        description: "La categoría se ha eliminado correctamente.",
      });
    } catch (error) {
      catchAxiosError(error);
    } finally {
      setDeletingCategory(undefined);
    }
  };

  const columns: ColumnDef<Category>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Nombre",
      },
      {
        accessorKey: "parentId",
        header: "Categoría Padre",
        cell: ({ row }) => {
          const parentName = row.original.parentName;
          return parentName ? (
            <Badge variant="secondary">{parentName}</Badge>
          ) : (
            "-"
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Fecha de Creación",
        cell: ({ row }) =>
          new Date(row.getValue("createdAt")).toLocaleDateString(),
      },
    ],
    []
  );

  const hasChildren = useMemo(() => {
    if (!deletingCategory) return false;
    return data?.data.some((cat) => cat.parentId === deletingCategory.id);
  }, [deletingCategory, data?.data]);

  return (
    <div className="space-y-4">
      <DataTable
        topBar={
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <FilterIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={filter}
                  onValueChange={(value) => setFilter(value as FilterValue)}
                >
                  <DropdownMenuRadioItem value="all">
                    Todas las categorías
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="parent">
                    Con categoría padre
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="no-parent">
                    Sin categoría padre
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog
              open={open}
              onOpenChange={(open) => {
                setOpen(open);
                if (!open) setEditingCategory(undefined);
              }}
            >
              <DialogTrigger asChild>
                <Button disabled={isLoading}>
                  <Plus className="h-4 w-4" />
                  Agregar Categoría
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Editar" : "Crear"} Categoría
                  </DialogTitle>
                  <DialogDescription>
                    Completa el formulario para{" "}
                    {editingCategory ? "editar la" : "crear una nueva"}{" "}
                    categoría.
                  </DialogDescription>
                </DialogHeader>
                <CategoryForm
                  category={editingCategory}
                  onSuccess={() => {
                    setOpen(false);
                    setEditingCategory(undefined);
                    onCategoryCreated?.();
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        }
        searchableColumn="name"
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        manualPagination
        pageCount={data?.pagination.totalPages || 0}
        currentPage={page}
        onPageChange={handlePageChange}
        pageSize={10}
        onSearch={handleSearch}
        searchValue={search}
        actions={{
          onEdit: (category) => {
            setEditingCategory(category);
            setOpen(true);
          },
          onDelete: setDeletingCategory,
        }}
      />
      <ConfirmDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(undefined)}
        title="Eliminar categoría"
        description={
          hasChildren
            ? "Esta categoría tiene subcategorías que se convertirán en categorías principales al eliminarla. ¿Estás seguro de que deseas continuar?"
            : "¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
        }
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
