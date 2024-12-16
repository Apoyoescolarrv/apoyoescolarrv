import { CoursesTable } from "@/components/admin/courses/courses-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Courses() {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Gestión de Cursos
            </h2>
          </div>
        </CardTitle>
        <CardDescription>
          Crea y administra los cursos de la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CoursesTable />
      </CardContent>
    </Card>
  );
}
