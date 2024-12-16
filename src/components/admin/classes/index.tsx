import { ClassesTable } from "@/components/admin/classes/classes-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Classes() {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Clases</h2>
          </div>
        </CardTitle>
        <CardDescription>
          Crea y administra las clases para tus cursos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ClassesTable />
      </CardContent>
    </Card>
  );
}
