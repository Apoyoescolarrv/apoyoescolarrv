"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Course, getCourses, deleteCourse } from "@/api/courses";
import { Badge } from "@/components/ui/badge";
import { catchAxiosError } from "@/lib/catch-axios-error";

export function CourseList() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const data = await getCourses();
      setCourses(data.courses);
    } catch (error) {
      catchAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCourse(id);
      toast({
        title: "Curso eliminado",
        description: "El curso se ha eliminado correctamente.",
      });
      fetchCourses();
    } catch (error) {
      catchAxiosError(error);
    }
  }

  if (isLoading) {
    return <div>Cargando cursos...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Fecha de Creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium">{course.title}</TableCell>
              <TableCell>${course.price}</TableCell>
              <TableCell>
                <Badge variant={course.isActive ? "default" : "secondary"}>
                  {course.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell>{course.categoryId || "-"}</TableCell>
              <TableCell>
                {new Date(course.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(course.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {courses.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No hay cursos creados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
