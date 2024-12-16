"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { CourseBasicsForm } from "./course-basics-form";
import { CourseModulesForm } from "./course-modules-form";
import { CourseClassesForm } from "./course-classes-form";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { CourseFormData, CourseModule, ModuleClass } from "@/types/course";
import { useClassesQuery } from "@/api/classes/query";

const steps = [
  {
    id: "basics",
    title: "Información Básica",
    description: "Configura la información principal del curso",
  },
  {
    id: "modules",
    title: "Módulos",
    description: "Crea y organiza los módulos del curso",
  },
  {
    id: "classes",
    title: "Clases",
    description: "Agrega y organiza las clases por módulo",
  },
  {
    id: "preview",
    title: "Vista Previa",
    description: "Revisa y publica el curso",
  },
];

export function CourseCreationStepper() {
  const [currentStep, setCurrentStep] = useState(0);
  const [courseData, setCourseData] = useState<Partial<CourseFormData>>({});
  const router = useRouter();
  const { toast } = useToast();
  const { data: classesData } = useClassesQuery();

  // Referencias a los formularios
  const basicsFormRef = useRef<HTMLFormElement>(null);
  const modulesFormRef = useRef<HTMLFormElement>(null);
  const classesFormRef = useRef<HTMLFormElement>(null);

  const handleBasicsSubmit = (data: CourseFormData["basics"]) => {
    setCourseData((prev) => ({ ...prev, basics: data }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleModulesSubmit = (modules: CourseModule[]) => {
    console.log("Módulos guardados:", modules);
    setCourseData((prev) => ({ ...prev, modules }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleClassesSubmit = (classes: Record<string, ModuleClass[]>) => {
    setCourseData((prev) => ({ ...prev, classes }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleCreateCourse = () => {
    // Aquí iría la lógica para crear el curso
    toast({
      title: "Curso creado",
      description: "El curso se ha creado correctamente.",
    });
    router.push("/courses");
  };

  const renderPreview = () => {
    if (!courseData.basics || !courseData.modules || !courseData.classes) {
      return null;
    }

    return (
      <div className="space-y-6">
        <div className="prose max-w-none">
          <h3>Vista Previa del Curso</h3>
          <div className="rounded-lg border p-4 space-y-4">
            <div>
              <h4 className="font-medium text-lg">{courseData.basics.title}</h4>
              <p className="text-muted-foreground">
                {courseData.basics.description}
              </p>
              <p className="text-sm">Precio: ${courseData.basics.price}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Módulos</h4>
              <div className="space-y-4">
                {courseData.modules.map((module) => {
                  const moduleClasses = courseData.classes?.[module.id!] || [];
                  return (
                    <div key={module.id} className="border rounded-lg p-4">
                      <h5 className="font-medium">{module.title}</h5>
                      <div className="mt-2 space-y-2">
                        {moduleClasses.map((moduleClass) => {
                          const classData = classesData?.data.find(
                            (c) => c.id === moduleClass.classId
                          );
                          if (!classData) return null;
                          return (
                            <div
                              key={moduleClass.classId}
                              className="text-sm text-muted-foreground pl-4"
                            >
                              • {classData.title}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleCreateCourse}>Crear Curso</Button>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <CourseBasicsForm
            formRef={basicsFormRef}
            onSubmit={handleBasicsSubmit}
            defaultValues={courseData.basics}
          />
        );
      case 1:
        return (
          <CourseModulesForm
            formRef={modulesFormRef}
            onSubmit={handleModulesSubmit}
            defaultValues={courseData.modules}
          />
        );
      case 2:
        console.log(
          "Renderizando paso de clases con módulos:",
          courseData.modules
        );
        if (!courseData.modules) {
          console.warn("No hay módulos disponibles");
          return null;
        }
        return (
          <CourseClassesForm
            formRef={classesFormRef}
            modules={courseData.modules}
            onSubmit={handleClassesSubmit}
            defaultValues={courseData.classes}
          />
        );
      case 3:
        return renderPreview();
      default:
        return null;
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      const confirmed = window.confirm(
        "¿Estás seguro de que deseas cancelar la creación del curso?"
      );
      if (confirmed) {
        router.push("/courses");
      }
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      handleCreateCourse();
      return;
    }

    // Obtener la referencia del formulario actual
    const currentFormRef = [basicsFormRef, modulesFormRef, classesFormRef][
      currentStep
    ];

    // Si hay un formulario, disparar su evento submit
    if (currentFormRef?.current) {
      currentFormRef.current.requestSubmit();
    } else {
      // Si no hay formulario (como en la vista previa), avanzar directamente
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-8">
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
          {steps.map((step, index) => (
            <li key={step.id} className="md:flex-1">
              <div
                className={cn(
                  "group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                  index <= currentStep
                    ? "border-primary"
                    : "border-muted-foreground/20"
                )}
              >
                <span className="text-sm font-medium">
                  <span className="flex items-center gap-2">
                    {index < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : index === currentStep ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : null}
                    {step.title}
                  </span>
                </span>
                <span className="text-sm text-muted-foreground">
                  {step.description}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-8">{renderStepContent()}</div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          {currentStep === 0 ? "Cancelar" : "Anterior"}
        </Button>
        <Button onClick={handleNext}>
          {currentStep === steps.length - 1 ? "Crear Curso" : "Siguiente"}
        </Button>
      </div>
    </div>
  );
}
