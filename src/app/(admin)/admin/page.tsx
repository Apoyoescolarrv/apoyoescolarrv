import { Header } from "@/components/landing/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CategoryForm } from "@/components/admin/category-form";
import { CourseForm } from "@/components/admin/course-form";
import { CategoriesTable } from "@/components/admin/categories-table";
import { CoursesTable } from "@/components/admin/courses-table";
import { getServerAdminData } from "@/api/admin";
import { cookies } from "next/headers";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  const {
    stats,
    categories: categoriesList,
    courses: coursesList,
  } = await getServerAdminData(token);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Panel de Administración
          </h2>
        </div>
        <Separator />
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="courses">Cursos</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
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
                  <CardTitle className="text-sm font-medium">
                    Total Cursos
                  </CardTitle>
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
          </TabsContent>
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Categorías</CardTitle>
                <CardDescription>
                  Crea y administra las categorías de los cursos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CategoryForm />
                <Separator />
                <CategoriesTable categories={categoriesList} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Cursos</CardTitle>
                <CardDescription>
                  Crea y administra los cursos de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CourseForm />
                <Separator />
                <CoursesTable courses={coursesList} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
