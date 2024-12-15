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

interface CategoriesTableProps {
  onCategoryCreated?: () => void;
}

export function CategoriesTable({ onCategoryCreated }: CategoriesTableProps) {
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();
  const [deletingCategory, setDeletingCategory] = useState<
    Category | undefined
  >();
  const { data: categories = [] } = useCategoriesQuery();
  const { mutateAsync: deleteCategory, isPending: isDeleting } =
    useDeleteCategoryMutation();
  const { toast } = useToast();

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
        cell: ({ row }) => row.getValue("parentId") || "-",
      },
      {
        accessorKey: "createdAt",
        header: "Fecha de Creación",
        cell: ({ row }) =>
          new Date(row.getValue("createdAt")).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
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
    []
  );

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
              <Button size="sm">
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
        data={categories}
      />
      <ConfirmDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(undefined)}
        title="Eliminar categoría"
        description="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
