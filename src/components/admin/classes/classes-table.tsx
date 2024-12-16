"use client";

import { useDeleteClassMutation } from "@/api/classes/mutations";
import { useClassesQuery } from "@/api/classes/query";
import { ClassForm } from "@/components/admin/classes/class-form";
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
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { catchAxiosError } from "@/lib/catch-axios-error";
import { Class } from "@/types/class";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDuration } from "@/lib/utils";

interface ClassesTableProps {
  onClassCreated?: () => void;
}

export function ClassesTable({ onClassCreated }: ClassesTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [open, setOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | undefined>();
  const [deletingClass, setDeletingClass] = useState<Class | undefined>();
  const { data, isLoading } = useClassesQuery({
    page,
    search: debouncedSearch,
  });
  const { mutateAsync: deleteClass, isPending: isDeleting } =
    useDeleteClassMutation();
  const { toast } = useToast();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deletingClass) return;

    try {
      await deleteClass(deletingClass.id);
      toast({
        title: "Clase eliminada",
        description: "La clase se ha eliminado correctamente.",
      });
    } catch (error) {
      catchAxiosError(error);
    } finally {
      setDeletingClass(undefined);
    }
  };

  const columns: ColumnDef<Class>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Título",
      },
      {
        accessorKey: "duration",
        header: "Duración",
        cell: ({ row }) => {
          const duration = row.getValue("duration") as number;
          return duration ? formatDuration(duration) : "-";
        },
      },
      {
        accessorKey: "isPreview",
        header: "Vista Previa",
        cell: ({ row }) => (
          <Badge
            variant={row.getValue("isPreview") ? "default" : "destructive"}
          >
            {row.getValue("isPreview") ? "Sí" : "No"}
          </Badge>
        ),
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

  return (
    <div className="space-y-4">
      <DataTable
        topBar={
          <Dialog
            open={open}
            onOpenChange={(open) => {
              setOpen(open);
              if (!open) setEditingClass(undefined);
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={isLoading}>
                <Plus className="h-4 w-4" />
                Nueva Clase
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl">
              <DialogHeader>
                <DialogTitle>
                  {editingClass ? "Editar" : "Crear"} Clase
                </DialogTitle>
                <DialogDescription>
                  Completa el formulario para{" "}
                  {editingClass ? "editar la" : "crear una nueva"} clase.
                </DialogDescription>
              </DialogHeader>

              <ClassForm
                class={editingClass}
                onSuccess={() => {
                  setOpen(false);
                  setEditingClass(undefined);
                  onClassCreated?.();
                }}
              />
            </DialogContent>
          </Dialog>
        }
        searchableColumn="title"
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
          onEdit: (class_) => {
            setEditingClass(class_);
            setOpen(true);
          },
          onDelete: setDeletingClass,
        }}
      />
      <ConfirmDialog
        open={!!deletingClass}
        onOpenChange={(open) => !open && setDeletingClass(undefined)}
        title="Eliminar clase"
        description="¿Estás seguro de que deseas eliminar esta clase? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
