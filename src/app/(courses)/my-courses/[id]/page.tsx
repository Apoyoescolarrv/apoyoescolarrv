"use client";

import {
  useSaveVideoProgressMutation,
  useUpdateCourseProgressMutation,
} from "@/api/courses/mutations";
import { useCourseQuery } from "@/api/courses/query";
import { usePurchasedCoursesQuery } from "@/api/purchases/query";
import CourseLoadingSkeleton from "@/components/course/course-loading-skeleton";
import { VideoPlayer } from "@/components/course/video-player";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, formatDuration } from "@/lib/utils";
import { Class } from "@/types/class";
import { Course } from "@/types/course";
import { Check, Play } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
  const [currentLesson, setCurrentLesson] = useState<Class | null>(null);
  const [completedLessons, setCompletedLessons] = useState<CompletedLessons>(
    {}
  );
  const [videoProgress, setVideoProgress] = useState<VideoProgress>({});
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: course, isLoading: courseLoading } = useCourseQuery(
    id as string
  );
  const { data: userCourses, isLoading: purchasesLoading } =
    usePurchasedCoursesQuery();
  const updateCourseProgress = useUpdateCourseProgressMutation();
  const saveVideoProgress = useSaveVideoProgressMutation();

  const isLoading = courseLoading || purchasesLoading;

  const hasAccess = useMemo(() => {
    if (!userCourses || !course) return false;
    return userCourses.some(
      (userCourse: Course) => userCourse.id === course.id
    );
  }, [userCourses, course]);

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
      const firstModule = course.modules[0];
      if (firstModule?.moduleClasses?.[0]?.class) {
        setCurrentLesson(firstModule.moduleClasses[0].class);
      }

      const saved = localStorage.getItem(`${COMPLETED_LESSONS_KEY}_${id}`);
      if (saved) {
        setCompletedLessons(JSON.parse(saved));
      }

      const savedProgress = localStorage.getItem(`${VIDEO_PROGRESS_KEY}_${id}`);
      if (savedProgress) {
        setVideoProgress(JSON.parse(savedProgress));
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
    return <CourseLoadingSkeleton />;
  }

  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center">
        Curso no encontrado
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-bold">Acceso Denegado</h2>
        <p className="text-muted-foreground">
          No tienes acceso a este curso. Por favor, adquiere el curso para ver
          su contenido.
        </p>
        <Link href={`/courses/${id}`}>
          <Button>Ver detalles del curso</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex flex-col lg:flex-row overflow-auto">
        {/* Main Content */}
        <main className="md:flex-1 min-h-0 bg-background">
          <div className="container max-w-6xl py-6">
            {currentLesson && (
              <VideoPlayer
                lesson={currentLesson}
                isCompleted={completedLessons[currentLesson.id]}
                progress={videoProgress[currentLesson.id] || 0}
                isPlaying={isPlaying}
                onProgress={handleProgress}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={handleComplete}
              />
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-full lg:w-[400px] lg:border-l bg-background lg:bg-transparent border-t lg:border-t-0 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] lg:shadow-none">
          <div className="p-4 md:p-6">
            {/* Course Progress */}
            <div className="mb-6 space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Progreso del curso</h2>
                <span className="text-sm text-muted-foreground">
                  {calculateTotalProgress()}%
                </span>
              </div>
              <Progress value={calculateTotalProgress()} />
            </div>

            {/* Module List */}
            <div className="space-y-6">
              {course.modules?.map((module) => (
                <div key={module.id} className="space-y-2">
                  <h3 className="font-medium capitalize">{module.title}</h3>
                  <div className="space-y-1.5">
                    {module.moduleClasses?.map((moduleClass) => {
                      const isCurrentLesson =
                        currentLesson?.id === moduleClass.class?.id;
                      const isCompleted =
                        completedLessons[moduleClass.class?.id || ""];
                      return (
                        <button
                          key={moduleClass.id}
                          onClick={() =>
                            moduleClass.class &&
                            setCurrentLesson(moduleClass.class)
                          }
                          className={cn(
                            "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors",
                            isCurrentLesson
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted",
                            "group"
                          )}
                        >
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : (
                              <Play className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {moduleClass.class?.title}
                            </p>
                            {moduleClass.class?.duration && (
                              <p className="text-xs text-muted-foreground">
                                {formatDuration(moduleClass.class.duration)}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
