import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Course, ModuleClass } from "@/types/course";
import {
  Check,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Play,
  X,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface CourseSidebarProps {
  course: Course;
  currentLesson: ModuleClass["class"] | null;
  completedLessons: Record<string, boolean>;
  onLessonSelect: (lesson: NonNullable<ModuleClass["class"]>) => void;
}

export function CourseSidebar({
  course,
  currentLesson,
  completedLessons,
  onLessonSelect,
}: CourseSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >(() => {
    const initialState: Record<string, boolean> = {};
    course.modules.forEach((module) => {
      if (module.id) {
        initialState[module.id] = true;
      }
    });
    return initialState;
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const totalLessons = course.modules.reduce(
    (acc, module) => acc + (module.moduleClasses?.length || 0),
    0
  );

  const completedCount = Object.values(completedLessons).filter(Boolean).length;

  const closeSidebar = () => {
    document
      .getElementById("course-sidebar")
      ?.classList.remove("translate-x-0");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Contenido del curso</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={closeSidebar}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress */}
      <div className="p-4 border-b">
        <div className="space-y-2">
          <Progress value={course.progress ?? 0} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount} de {totalLessons} lecciones
            </span>
            <span className="font-medium">{course.progress ?? 0}%</span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Lista de módulos */}
          <div className="space-y-4">
            {course.modules.map((module, moduleIndex) => {
              if (!module.id) return null;
              const moduleClasses = module.moduleClasses || [];

              return (
                <div key={module.id} className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-2 h-auto"
                    onClick={() => toggleModule(module.id!)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-shrink-0">
                        {expandedModules[module.id] ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="h-5 w-5 p-0 flex items-center justify-center rounded-full font-normal text-xs"
                          >
                            {moduleIndex + 1}
                          </Badge>
                          <span className="font-medium text-sm truncate">
                            {module.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Button>

                  {expandedModules[module.id] && (
                    <div className="pl-11 space-y-0.5">
                      {moduleClasses.map((moduleClass) => {
                        if (!moduleClass.class || !moduleClass.classId)
                          return null;
                        const isActive =
                          currentLesson?.id === moduleClass.class.id;
                        const isCompleted =
                          completedLessons[moduleClass.classId];

                        return (
                          <Button
                            key={moduleClass.classId}
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start h-auto py-2 px-3 relative",
                              isCompleted && "text-green-600",
                              isActive && "bg-secondary"
                            )}
                            onClick={() => {
                              onLessonSelect(moduleClass.class!);
                              closeSidebar();
                            }}
                          >
                            <div className="flex items-start gap-2 min-w-0">
                              <div className="mt-0.5 flex-shrink-0">
                                {isCompleted ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </div>
                              <span className="text-sm font-medium line-clamp-2 text-left">
                                {moduleClass.class.title}
                              </span>
                            </div>
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
