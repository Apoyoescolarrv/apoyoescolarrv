"use client";

import { useClassesQuery } from "@/api/classes/query";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDuration } from "@/lib/utils";
import { Class } from "@/types/class";
import { CourseModule, ModuleClass } from "@/types/course";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CourseClassesFormProps {
  modules: CourseModule[];
  onSubmit: (moduleClasses: Record<string, ModuleClass[]>) => void;
  defaultValues?: Record<string, ModuleClass[]>;
  formRef: React.RefObject<HTMLFormElement | null>;
}

interface DraggableClassItemProps {
  id: string;
  class: Class;
  onRemove?: () => void;
  showRemove?: boolean;
}

function DraggableClassItem({
  id,
  class: classItem,
  onRemove,
  showRemove = false,
}: DraggableClassItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center gap-4 rounded-lg border bg-background p-4",
        isDragging && "opacity-50"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="cursor-move">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{classItem.title}</h4>
        <p className="text-sm text-muted-foreground">{classItem.description}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          {formatDuration(classItem.duration || 0)}
        </Badge>
        {showRemove && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function ClassItem({ class: classItem }: { class: Class }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-background p-4">
      <div className="cursor-move">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{classItem.title}</h4>
        <p className="text-sm text-muted-foreground">{classItem.description}</p>
      </div>
      <Badge variant="secondary">
        {formatDuration(classItem.duration || 0)}
      </Badge>
    </div>
  );
}

function ClassSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <Skeleton className="h-5 w-5" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-3 w-[150px]" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  );
}

function DroppableModule({
  module,
  children,
}: {
  module: CourseModule;
  children: React.ReactNode;
}) {
  const moduleId = module.id || module.courseId;
  const { setNodeRef, isOver } = useDroppable({
    id: `module-${moduleId || ""}`,
    data: {
      type: "module",
      moduleId,
    },
  });

  if (!moduleId) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "space-y-2 min-h-[100px] p-2 rounded-lg border-2 border-dashed transition-colors",
        isOver && "border-primary bg-primary/5"
      )}
    >
      {children}
    </div>
  );
}

export function CourseClassesForm({
  modules,
  onSubmit,
  defaultValues = {},
  formRef,
}: CourseClassesFormProps) {
  const [moduleClasses, setModuleClasses] =
    useState<Record<string, ModuleClass[]>>(defaultValues);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { data: classesData, isLoading } = useClassesQuery();
  const [search, setSearch] = useState("");

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Si el destino es la lista de clases disponibles
    if (overId === "available" && activeId.includes("module-")) {
      const [, sourceModuleId, classId] = activeId.split("-");

      setModuleClasses((prev) => {
        const sourceClasses = prev[sourceModuleId] || [];
        const newSourceClasses = sourceClasses
          .filter((mc) => mc.classId !== classId)
          .map((mc, index) => ({ ...mc, order: index }));

        const newModuleClasses = { ...prev };
        newModuleClasses[sourceModuleId] = newSourceClasses;
        return newModuleClasses;
      });
      return;
    }

    // Si el destino es un módulo
    if (overId.startsWith("module-")) {
      const targetModuleId = (over.data.current as { moduleId: string })
        ?.moduleId;
      if (!targetModuleId) {
        return;
      }

      const activeClassId = activeId.includes("module-")
        ? activeId.split("-")[2]
        : activeId;

      // Si es una clase de la lista de disponibles
      if (!activeId.includes("module-")) {
        const activeClass = classesData?.data.find(
          (c) => c.id === activeClassId
        );
        if (!activeClass) return;

        setModuleClasses((prev) => {
          const targetClasses = prev[targetModuleId] || [];

          // Verificar si la clase ya existe en cualquier módulo
          const existsInAnyModule = Object.values(prev).some((moduleClasses) =>
            moduleClasses.some((mc) => mc.classId === activeClassId)
          );

          if (existsInAnyModule) {
            return prev;
          }

          const newModuleClasses = { ...prev };
          newModuleClasses[targetModuleId] = [
            ...targetClasses,
            {
              classId: activeClassId,
              moduleId: targetModuleId,
              order: targetClasses.length,
            },
          ];
          return newModuleClasses;
        });
      } else {
        const [, sourceModuleId] = activeId.split("-");

        if (sourceModuleId === targetModuleId) {
          // Reordenar dentro del mismo módulo
          const sourceClasses = moduleClasses[sourceModuleId] || [];
          const oldIndex = sourceClasses.findIndex(
            (mc) => mc.classId === activeClassId
          );
          const newIndex = sourceClasses.length - 1;

          if (oldIndex === -1) return;

          const newClasses = [...sourceClasses];
          const [movedClass] = newClasses.splice(oldIndex, 1);
          newClasses.splice(newIndex, 0, movedClass);

          setModuleClasses((prev) => {
            const newModuleClasses = { ...prev };
            newModuleClasses[sourceModuleId] = newClasses.map((mc, index) => ({
              ...mc,
              order: index,
            }));
            return newModuleClasses;
          });
        } else {
          // Mover entre módulos
          const sourceClasses = moduleClasses[sourceModuleId] || [];
          const targetClasses = moduleClasses[targetModuleId] || [];
          const movedClass = sourceClasses.find(
            (mc) => mc.classId === activeClassId
          );

          if (!movedClass) return;

          setModuleClasses((prev) => {
            const newModuleClasses = { ...prev };
            newModuleClasses[sourceModuleId] = sourceClasses
              .filter((mc) => mc.classId !== activeClassId)
              .map((mc, index) => ({ ...mc, order: index }));
            newModuleClasses[targetModuleId] = [
              ...targetClasses,
              {
                ...movedClass,
                moduleId: targetModuleId,
                order: targetClasses.length,
              },
            ];
            return newModuleClasses;
          });
        }
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const availableClasses = classesData?.data.filter((classItem) => {
    const assignedClasses = Object.values(moduleClasses).flat();
    return !assignedClasses.find((mc) => mc.classId === classItem.id);
  });

  const activeClass = activeId
    ? classesData?.data.find(
        (c) =>
          c.id ===
          (activeId.includes("module-") ? activeId.split("-")[2] : activeId)
      )
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Asegurarnos de que cada módulo tenga un array de clases, aunque esté vacío
    const completeModuleClasses = modules.reduce((acc, module) => {
      if (!module.id) return acc;
      return {
        ...acc,
        [module.id]: moduleClasses[module.id] || [],
      };
    }, {} as Record<string, ModuleClass[]>);

    onSubmit(completeModuleClasses);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lista de clases disponibles */}
          <div className="relative">
            <div className="sticky top-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Clases Disponibles</CardTitle>
                      <CardDescription>
                        Arrastra las clases a los módulos correspondientes
                      </CardDescription>
                      <Input
                        placeholder="Buscar clases..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full mt-3"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <ClassSkeleton key={`skeleton-${i}`} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2" id="available">
                      {availableClasses
                        ?.filter((classItem) =>
                          classItem.title
                            .toLowerCase()
                            .includes(search.toLowerCase())
                        )
                        .map((classItem) => (
                          <DraggableClassItem
                            key={`available-${classItem.id}`}
                            id={classItem.id}
                            class={classItem}
                          />
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Módulos */}
          <div className="space-y-4">
            {modules.map((module) => {
              const moduleId = module.id;
              if (!moduleId) {
                return null;
              }

              return (
                <Card key={moduleId}>
                  <CardHeader>
                    <CardTitle>{module.title}</CardTitle>
                    <CardDescription>
                      {moduleClasses[moduleId]?.length || 0} clases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DroppableModule module={module}>
                      <SortableContext
                        items={
                          moduleClasses[moduleId]?.map(
                            (mc) => `module-${moduleId}-${mc.classId}`
                          ) || []
                        }
                        strategy={verticalListSortingStrategy}
                      >
                        {moduleClasses[moduleId]?.map((moduleClass) => {
                          const classItem = classesData?.data.find(
                            (c) => c.id === moduleClass.classId
                          );
                          if (!classItem) return null;
                          return (
                            <DraggableClassItem
                              key={`module-class-${moduleId}-${moduleClass.classId}`}
                              id={`module-${moduleId}-${moduleClass.classId}`}
                              class={classItem}
                              showRemove
                              onRemove={() => {
                                setModuleClasses((prev) => {
                                  const moduleClasses = prev[moduleId] || [];
                                  return {
                                    ...prev,
                                    [moduleId]: moduleClasses
                                      .filter(
                                        (mc) =>
                                          mc.classId !== moduleClass.classId
                                      )
                                      .map((mc, index) => ({
                                        ...mc,
                                        order: index,
                                      })),
                                  };
                                });
                              }}
                            />
                          );
                        })}
                      </SortableContext>
                      {moduleClasses[moduleId]?.length === 0 && (
                        <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                          Arrastra las clases aquí
                        </div>
                      )}
                    </DroppableModule>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <DragOverlay>
          {activeClass ? <ClassItem class={activeClass} /> : null}
        </DragOverlay>
      </DndContext>
    </form>
  );
}
