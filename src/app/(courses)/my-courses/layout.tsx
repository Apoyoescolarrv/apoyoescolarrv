import { Header } from "@/components/landing/header";
import { Separator } from "@/components/ui/separator";

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container mx-auto flex-1 space-y-4 p-8 pt-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Mis Cursos</h2>
          <p className="text-muted-foreground">
            Aquí podrás ver los cursos que has comprado.
          </p>
        </div>
        <Separator />
        {children}
      </div>
    </div>
  );
}
