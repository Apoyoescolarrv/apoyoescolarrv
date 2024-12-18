"use client";

import { useCourseQuery } from "@/api/courses/query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModuleClass } from "@/types/course";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

interface CourseProgress {
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
}

const PROGRESS_KEY = "course_progress";

export default function CoursePage() {
  const { id } = useParams();
  const [currentLesson, setCurrentLesson] = useState<
    ModuleClass["class"] | null
  >(null);
  const [progress, setProgress] = useState<CourseProgress[]>([]);

  const { data: course, isLoading, error } = useCourseQuery(id as string);

  useEffect(() => {
    if (course) {
      // Cargar la primera clase disponible
      const firstModule = course.modules[0];
      if (firstModule?.moduleClasses?.[0]?.class) {
        setCurrentLesson(firstModule.moduleClasses[0].class);
      }

      // Cargar progreso guardado
      const savedProgress = localStorage.getItem(`${PROGRESS_KEY}_${id}`);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    }
  }, [course, id]);

  const handleLessonComplete = (lessonId: string) => {
    setProgress((prev) => {
      const newProgress = prev.map((p) =>
        p.lessonId === lessonId ? { ...p, completed: true } : p
      );

      if (!prev.find((p) => p.lessonId === lessonId)) {
        newProgress.push({
          lessonId,
          completed: true,
          watchedSeconds: currentLesson?.duration || 0,
        });
      }

      localStorage.setItem(
        `${PROGRESS_KEY}_${id}`,
        JSON.stringify(newProgress)
      );

      return newProgress;
    });
  };

  const handleProgress = ({ playedSeconds }: { playedSeconds: number }) => {
    if (!currentLesson) return;

    setProgress((prev) => {
      const newProgress = [...prev];
      const existingProgress = prev.find(
        (p) => p.lessonId === currentLesson.id
      );

      if (existingProgress) {
        const updatedProgress = prev.map((p) =>
          p.lessonId === currentLesson.id
            ? { ...p, watchedSeconds: playedSeconds }
            : p
        );
        localStorage.setItem(
          `${PROGRESS_KEY}_${id}`,
          JSON.stringify(updatedProgress)
        );
        return updatedProgress;
      }

      const progressEntry = {
        lessonId: currentLesson.id,
        completed: false,
        watchedSeconds: playedSeconds,
      };
      newProgress.push(progressEntry);

      localStorage.setItem(
        `${PROGRESS_KEY}_${id}`,
        JSON.stringify(newProgress)
      );

      return newProgress;
    });
  };

  const getLessonProgress = (lessonId: string) => {
    const lessonProgress = progress.find((p) => p.lessonId === lessonId);
    if (!lessonProgress) return 0;

    const lesson = course?.modules
      .flatMap((m) => m.moduleClasses?.map((mc) => mc.class))
      .find((c) => c?.id === lessonId);

    if (!lesson?.duration) return 0;
    return (lessonProgress.watchedSeconds / lesson.duration) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        Error al cargar el curso
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center">
        Curso no encontrado
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-background border-r">
        <ScrollArea className="h-full">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Módulos</h2>
            {course.modules.map((module) => (
              <div key={module.id} className="mb-6">
                <h3 className="font-semibold mb-2">{module.title}</h3>
                <div className="space-y-2">
                  {module.moduleClasses?.map((moduleClass) => (
                    <div key={moduleClass.classId} className="space-y-1">
                      <Button
                        variant={
                          currentLesson?.id === moduleClass.class?.id
                            ? "secondary"
                            : "ghost"
                        }
                        className="w-full justify-start text-left"
                        onClick={() =>
                          moduleClass.class &&
                          setCurrentLesson(moduleClass.class)
                        }
                      >
                        {moduleClass.class?.title}
                      </Button>
                      <Progress
                        value={getLessonProgress(moduleClass.classId)}
                        className="h-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {currentLesson && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
              <p className="text-muted-foreground">
                {currentLesson.description}
              </p>
            </div>

            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <ReactPlayer
                url={currentLesson.videoUrl}
                width="100%"
                height="100%"
                controls
                onProgress={handleProgress}
                onEnded={() => handleLessonComplete(currentLesson.id)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
