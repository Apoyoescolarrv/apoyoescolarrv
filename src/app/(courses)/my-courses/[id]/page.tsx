"use client";

import {
  useSaveVideoProgressMutation,
  useUpdateCourseProgressMutation,
} from "@/api/courses/mutations";
import { useCourseQuery } from "@/api/courses/query";
import { usePurchasedCoursesQuery } from "@/api/purchases/query";
import { Button } from "@/components/ui/button";
import { Course } from "@/types/course";
import { Class } from "@/types/class";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CourseLoadingSkeleton from "./loading";
import { VideoPlayer } from "@/components/course/video-player";
import { CourseSidebar } from "@/components/course/course-sidebar";

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
    <div className="flex flex-col lg:flex-row h-screen">
      <main className="flex-1 overflow-auto">
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

      {/* Mobile Toggle */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 p-4 bg-background border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            document
              .getElementById("course-sidebar")
              ?.classList.toggle("translate-x-0")
          }
        >
          Ver contenido del curso
        </Button>
      </div>

      {/* Sidebar */}
      <div
        id="course-sidebar"
        className="fixed lg:relative inset-y-0 right-0 w-full lg:w-80 bg-background transform translate-x-full lg:translate-x-0 transition-transform duration-200 ease-in-out z-50"
      >
        <CourseSidebar
          course={course}
          currentLesson={currentLesson}
          completedLessons={completedLessons}
          onLessonSelect={setCurrentLesson}
        />
      </div>
    </div>
  );
}
