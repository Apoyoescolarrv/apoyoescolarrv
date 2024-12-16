"use client";

import { useCoursesQuery } from "@/api/courses/query";
import { useDeleteCourseMutation } from "@/api/courses/mutations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Course } from "@/types/courses";
import { Category } from "@/types/category";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { CourseForm } from "./course-form";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { catchAxiosError } from "@/lib/catch-axios-error";
import { useCategoriesQuery } from "@/api/categories/query";
import { useDebounce } from "@/hooks/use-debounce";

interface CoursesTableProps {
  onCourseCreated?: () => void;
}

export function CoursesTable({ onCourseCreated }: CoursesTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [open, setOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();
  const [deletingCourse, setDeletingCourse] = useState<Course | undefined>();
  const { data, isLoading } = useCoursesQuery({
    page,
    search: debouncedSearch,
  });
  const { data: categoriesData } = useCategoriesQuery();
  const { mutateAsync: deleteCourse, isPending: isDeleting } =
    useDeleteCourseMutation();
  const { toast } = useToast();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;

    try {
      await deleteCourse(deletingCourse.id);
      toast({
        title: "Curso eliminado",
        description: "El curso se ha eliminado correctamente.",
      });
    } catch (error) {
      catchAxiosError(error);
    } finally {
      setDeletingCourse(undefined);
    }
  };

  const columns: ColumnDef<Course>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Título",
      },
      {
        accessorKey: "price",
        header: "Precio",
        cell: ({ row }) => (
          <Badge variant="outline">${row.getValue("price")}</Badge>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Estado",
        cell: ({ row }) => (
          <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
            {row.getValue("isActive") ? "Activo" : "Inactivo"}
          </Badge>
        ),
      },
      {
        accessorKey: "categoryId",
        header: "Categoría",
        cell: ({ row }) => {
          const categoryId = row.getValue("categoryId");
          if (!categoryId) return "-";

          const category = categoriesData?.data?.find(
            (cat: Category) => cat.id === categoryId
          );
          return <Badge variant="secondary">{category?.name || "-"}</Badge>;
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
                setEditingCourse(row.original);
                setOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeletingCourse(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [categoriesData?.data]
  );

  return (
    <div className="space-y-4">
      <DataTable
        topBar={
          <Dialog
            open={open}
            onOpenChange={(open) => {
              setOpen(open);
              if (!open) setEditingCourse(undefined);
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" disabled={isLoading}>
                <Plus className="h-4 w-4" />
                Agregar Curso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCourse ? "Editar" : "Crear"} Curso
                </DialogTitle>
                <DialogDescription>
                  Completa el formulario para{" "}
                  {editingCourse ? "editar el" : "crear un nuevo"} curso.
                </DialogDescription>
              </DialogHeader>
              <CourseForm
                course={editingCourse}
                onSuccess={() => {
                  setOpen(false);
                  setEditingCourse(undefined);
                  onCourseCreated?.();
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
      />
      <ConfirmDialog
        open={!!deletingCourse}
        onOpenChange={(open) => !open && setDeletingCourse(undefined)}
        title="Eliminar curso"
        description="¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
