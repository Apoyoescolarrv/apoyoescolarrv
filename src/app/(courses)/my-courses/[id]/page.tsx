"use client";

import {
  useUpdateCourseProgressMutation,
  useSaveVideoProgressMutation,
} from "@/api/courses/mutations";
import { useCourseQuery } from "@/api/courses/query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ModuleClass } from "@/types/course";
import { Check, Loader2, Play } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

interface CompletedLessons {
  [key: string]: boolean;
}

interface VideoProgress {
  [key: string]: number; // lessonId -> seconds
}

const COMPLETED_LESSONS_KEY = "completed_lessons";
const VIDEO_PROGRESS_KEY = "video_progress";

export default function CoursePage() {
  const { id } = useParams();
  const [currentLesson, setCurrentLesson] = useState<
    ModuleClass["class"] | null
  >(null);
  const [completedLessons, setCompletedLessons] = useState<CompletedLessons>(
    {}
  );
  const [videoProgress, setVideoProgress] = useState<VideoProgress>({});
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: course, isLoading, error } = useCourseQuery(id as string);
  const updateCourseProgress = useUpdateCourseProgressMutation();
  const saveVideoProgress = useSaveVideoProgressMutation();

  const calculateTotalProgress = () => {
    if (!course) return 0;

    // Obtener la duración total del curso
    const totalDuration = course.modules.reduce((total, module) => {
      const moduleDuration =
        module.moduleClasses?.reduce((moduleTotal, moduleClass) => {
          return moduleTotal + (moduleClass.class?.duration ?? 0);
        }, 0) ?? 0;
      return total + moduleDuration;
    }, 0);

    if (totalDuration === 0) return 0;

    // Calcular segundos totales vistos
    const totalWatched = course.modules.reduce((total, module) => {
      const moduleWatched =
        module.moduleClasses?.reduce((moduleTotal, moduleClass) => {
          const classId = moduleClass.class?.id ?? "";
          return moduleTotal + (videoProgress[classId] ?? 0);
        }, 0) ?? 0;
      return total + moduleWatched;
    }, 0);

    return Math.round((totalWatched / totalDuration) * 100);
  };

  const handleProgress = ({ playedSeconds }: { playedSeconds: number }) => {
    if (!currentLesson) return;

    // Guardar progreso cada 2 segundos
    if (Math.abs(playedSeconds - (videoProgress[currentLesson.id] || 0)) > 2) {
      setVideoProgress((prev) => {
        const updated = { ...prev, [currentLesson.id]: playedSeconds };
        localStorage.setItem(
          `${VIDEO_PROGRESS_KEY}_${id}`,
          JSON.stringify(updated)
        );
        return updated;
      });

      saveVideoProgress.mutate({
        courseId: id as string,
        lessonId: currentLesson.id,
        seconds: Math.floor(playedSeconds),
      });

      // Actualizar progreso general del curso
      const totalProgress = calculateTotalProgress();
      updateCourseProgress.mutate({
        courseId: id as string,
        progress: totalProgress,
      });

      // Si ha visto más del 90%, marcar como completada
      if (
        currentLesson.duration &&
        playedSeconds / currentLesson.duration > 0.9
      ) {
        handleComplete();
      }
    }
  };

  // Cargar el progreso guardado al inicio
  useEffect(() => {
    if (course) {
      // Cargar la primera clase disponible
      const firstModule = course.modules[0];
      if (firstModule?.moduleClasses?.[0]?.class) {
        setCurrentLesson(firstModule.moduleClasses[0].class);
      }

      // Cargar datos guardados
      const saved = localStorage.getItem(`${COMPLETED_LESSONS_KEY}_${id}`);
      if (saved) {
        setCompletedLessons(JSON.parse(saved));
      }

      // Cargar progreso de videos y actualizar progreso general
      const savedProgress = localStorage.getItem(`${VIDEO_PROGRESS_KEY}_${id}`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setVideoProgress(progress);
      }
    }
  }, [course, id]);

  const updateProgress = () => {
    if (!course) return;

    const allClasses = course.modules.flatMap(
      (m) => m.moduleClasses?.map((mc) => mc.class) ?? []
    );
    const totalClasses = allClasses.length;
    if (totalClasses === 0) return;

    const completedCount =
      Object.values(completedLessons).filter(Boolean).length;
    const progress = Math.round((completedCount / totalClasses) * 100);

    updateCourseProgress.mutate({ courseId: id as string, progress });
  };

  const handleComplete = () => {
    if (!currentLesson) return;

    setCompletedLessons((prev) => {
      const updated = { ...prev, [currentLesson.id]: true };
      localStorage.setItem(
        `${COMPLETED_LESSONS_KEY}_${id}`,
        JSON.stringify(updated)
      );
      return updated;
    });

    updateProgress();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
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

            {/* Progreso general del curso */}
            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progreso del curso</span>
                <span>{course.progress ?? 0}%</span>
              </div>
              <Progress value={course.progress ?? 0} className="h-2" />
            </div>

            {course.modules.map((module) => (
              <div key={module.id} className="mb-6">
                <h3 className="font-semibold mb-2">{module.title}</h3>
                <div className="space-y-2">
                  {module.moduleClasses?.map((moduleClass) => (
                    <Button
                      key={moduleClass.classId}
                      variant={
                        currentLesson?.id === moduleClass.class?.id
                          ? "secondary"
                          : "ghost"
                      }
                      className={cn(
                        "w-full justify-between text-left",
                        completedLessons[moduleClass.classId] &&
                          "text-green-600"
                      )}
                      onClick={() =>
                        moduleClass.class && setCurrentLesson(moduleClass.class)
                      }
                    >
                      <span className="flex items-center gap-2">
                        {completedLessons[moduleClass.classId] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        {moduleClass.class?.title}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {currentLesson && (
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
              <p className="text-muted-foreground mt-2">
                {currentLesson.description}
              </p>
            </div>

            <div className="relative">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <ReactPlayer
                  url={currentLesson.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing={isPlaying}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onProgress={handleProgress}
                  onEnded={handleComplete}
                  progressInterval={2000}
                  config={{
                    youtube: {
                      playerVars: {
                        modestbranding: 1,
                        rel: 0,
                        start: Math.floor(
                          videoProgress[currentLesson?.id || ""] || 0
                        ),
                      },
                    },
                  }}
                />
              </div>

              {/* Video Progress Info */}
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  {completedLessons[currentLesson.id] && (
                    <span className="flex items-center gap-1 text-green-600">
                      <Check className="h-4 w-4" />
                      Completada
                    </span>
                  )}
                </div>
                <Progress
                  value={
                    videoProgress[currentLesson.id]
                      ? ((videoProgress[currentLesson.id] || 0) /
                          (currentLesson.duration || 1)) *
                        100
                      : 0
                  }
                  className="w-1/2 h-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
