import { CategoriesTable } from "@/components/admin/categories/categories-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Categories() {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Categorías</h2>
          </div>
        </CardTitle>
        <CardDescription>
          Crea y administra las categorías de los cursos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CategoriesTable />
      </CardContent>
    </Card>
  );
}
