import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CourseCreationStepper } from "@/components/admin/courses/course-creation-stepper";

export default function NewCoursePage() {
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Curso</h1>
          <p className="text-sm text-muted-foreground">
            Completa los pasos para crear un nuevo curso.
          </p>
        </div>
      </div>
      <Separator className="my-6" />
      <Card className="p-6">
        <CourseCreationStepper />
      </Card>
    </div>
  );
}
