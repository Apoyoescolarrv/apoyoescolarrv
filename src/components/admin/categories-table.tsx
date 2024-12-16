"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Category } from "@/types/category";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryForm } from "./category-form";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useCategoriesQuery } from "@/api/categories/query";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { catchAxiosError } from "@/lib/catch-axios-error";
import { useDeleteCategoryMutation } from "@/api/categories/mutations";
import { Badge } from "../ui/badge";
import { useDebounce } from "@/hooks/use-debounce";

interface CategoriesTableProps {
  onCategoryCreated?: () => void;
}

export function CategoriesTable({ onCategoryCreated }: CategoriesTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();
  const [deletingCategory, setDeletingCategory] = useState<
    Category | undefined
  >();
  const { data, isLoading } = useCategoriesQuery({
    page,
    search: debouncedSearch,
  });
  const { mutateAsync: deleteCategory, isPending: isDeleting } =
    useDeleteCategoryMutation();
  const { toast } = useToast();
  console.log(data);
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
          const parentId = row.getValue("parentId");
          if (!parentId) return "-";

          const parentCategory = data?.data.find(
            (category) => category.id === parentId
          );
          return <Badge variant="secondary">{parentCategory?.name}</Badge>;
        },
      },
      {
        accessorKey: "createdAt",
        header: "Fecha de Creación",
        cell: ({ row }) =>
          new Date(row.getValue("createdAt")).toLocaleDateString(),
      },
      {
        id: "actions",
        header: () => <div className="text-center">Acciones</div>,
        cell: ({ row }) => (
          <div className="flex justify-center text-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditingCategory(row.original);
                setOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeletingCategory(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [data?.data]
  );

  const hasChildren = useMemo(() => {
    if (!deletingCategory) return false;
    return data?.data.some((cat) => cat.parentId === deletingCategory.id);
  }, [deletingCategory, data?.data]);

  return (
    <div className="space-y-4">
      <DataTable
        topBar={
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
                  {editingCategory ? "editar la" : "crear una nueva"} categoría.
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
