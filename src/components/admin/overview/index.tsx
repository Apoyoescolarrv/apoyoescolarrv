import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Overview({
  stats,
}: {
  stats: { categories: number; courses: number; users: number };
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Categorías
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.categories}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.courses}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Estudiantes Registrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.users}</div>
        </CardContent>
      </Card>
    </div>
  );
}
