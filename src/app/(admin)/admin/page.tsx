import { getServerAdminData } from "@/api/admin";
import Categories from "@/components/admin/categories";
import Classes from "@/components/admin/classes";
import Courses from "@/components/admin/courses";
import Overview from "@/components/admin/overview";
import Users from "@/components/admin/users";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cookies } from "next/headers";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  const { stats } = await getServerAdminData(token);

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Vista General</TabsTrigger>
        <TabsTrigger value="categories">Categorías</TabsTrigger>
        <TabsTrigger value="courses">Cursos</TabsTrigger>
        <TabsTrigger value="classes">Clases</TabsTrigger>
        <TabsTrigger value="users">Usuarios</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <Overview stats={stats} />
      </TabsContent>
      <TabsContent value="categories" className="space-y-4">
        <Categories />
      </TabsContent>
      <TabsContent value="courses" className="space-y-4">
        <Courses />
      </TabsContent>
      <TabsContent value="classes" className="space-y-4">
        <Classes />
      </TabsContent>
      <TabsContent value="users" className="space-y-4">
        <Users />
      </TabsContent>
    </Tabs>
  );
}
