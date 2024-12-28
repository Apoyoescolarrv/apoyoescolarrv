"use client";

import { useCourseQuery } from "@/api/courses/query";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Module } from "@/components/course/module";
import { ShareButtons } from "@/components/course/share-buttons";
import { TableOfContents } from "@/components/course/table-of-contents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDuration } from "@/lib/format";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  GraduationCap,
  Play,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const benefitAnimation = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.2 },
};

const containerAnimation = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function CoursePage() {
  const router = useRouter();
  const { slug } = useParams();
  const { data: course, isLoading } = useCourseQuery(slug as string);
  const [previewVideo, setPreviewVideo] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[250px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="w-full h-64" />
              <Skeleton className="w-full h-24" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="w-full h-32" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent>
            <p className="text-center py-8">Curso no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalClasses = course.modules?.reduce(
    (acc, module) => acc + (module.moduleClasses?.length || 0),
    0
  );

  const totalDuration = course.modules?.reduce((acc, module) => {
    const moduleDuration =
      module.moduleClasses?.reduce(
        (sum, moduleClass) => sum + (moduleClass.class?.duration || 0),
        0
      ) || 0;
    return acc + moduleDuration;
  }, 0);

  return (
    <>
      <div className="container mx-auto py-8">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold">
                    {course.title}
                  </CardTitle>
                  {course.category && (
                    <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      {course.category.name}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full aspect-video group">
                  {previewVideo?.url ? (
                    <video
                      src={previewVideo.url}
                      controls
                      className="w-full h-full"
                      autoPlay
                    >
                      Tu navegador no soporta el elemento de video.
                    </video>
                  ) : course.previewVideoUrl ? (
                    <video
                      src={course.previewVideoUrl}
                      controls
                      className="w-full h-full"
                      poster={course.thumbnail}
                    >
                      Tu navegador no soporta el elemento de video.
                    </video>
                  ) : course.thumbnail ? (
                    <>
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        draggable={false}
                        fill
                        className="object-cover"
                        priority
                      />
                      {course.previewVideoUrl && (
                        <button
                          onClick={() =>
                            setPreviewVideo({
                              url: course.previewVideoUrl!,
                              title: "Vista previa del curso",
                            })
                          }
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="h-8 w-8 text-primary" />
                          </div>
                        </button>
                      )}
                    </>
                  ) : null}
                </div>

                <div className="p-6 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                      <div className="flex flex-col items-center text-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        <div>
                          <div className="font-semibold">
                            {course._count?.students ?? 0}
                          </div>
                          <div className="text-sm text-gray-500">
                            Estudiantes
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center text-center gap-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                        <div>
                          <div className="font-semibold">
                            {course.modules?.length}
                          </div>
                          <div className="text-sm text-gray-500">Módulos</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center text-center gap-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <div>
                          <div className="font-semibold">{totalClasses}</div>
                          <div className="text-sm text-gray-500">Clases</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center text-center gap-2">
                        <Clock className="h-6 w-6 text-primary" />
                        <div>
                          <div className="font-semibold">
                            {formatDuration(totalDuration || 0)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Duración total
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="prose max-w-none">
                    <h2 className="text-xl font-semibold mb-4">
                      Descripción del curso
                    </h2>
                    <p className="text-gray-600 whitespace-pre-line">
                      {course.description}
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Lo que aprenderás
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.modules?.slice(0, 4).map((module) => (
                        <div key={module.id} className="flex items-start gap-2">
                          <div className="mt-1 text-primary">✓</div>
                          <div>{module.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Contenido del curso
                    </h2>
                    <div className="space-y-2">
                      {course.modules?.map((module, index) => (
                        <Module
                          key={module.id}
                          module={module}
                          index={index}
                          onPreviewClick={(url, title) =>
                            setPreviewVideo({ url, title })
                          }
                          isActive={index === activeModuleIndex}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:sticky lg:top-8 space-y-6"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">
                        {formatCurrency(course.price)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Acceso por 1 año completo
                      </p>
                    </div>

                    <div className="space-y-4">
                      {course && (
                        <AddToCartButton
                          course={course}
                          className="w-full"
                          size="lg"
                        />
                      )}

                      <motion.div
                        className="text-sm text-gray-500 space-y-3"
                        variants={containerAnimation}
                        initial="initial"
                        animate="animate"
                      >
                        <motion.div
                          className="flex items-center gap-2"
                          variants={benefitAnimation}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-primary text-lg">✓</span>
                          <span>Acceso al curso por 1 año</span>
                        </motion.div>

                        <motion.div
                          className="flex items-center gap-2"
                          variants={benefitAnimation}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-primary text-lg">✓</span>
                          <span>Certificado de finalización</span>
                        </motion.div>

                        <motion.div
                          className="flex items-center gap-2"
                          variants={benefitAnimation}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-primary text-lg">✓</span>
                          <span>Grupo de WhatsApp de soporte por 1 año</span>
                        </motion.div>

                        <motion.div
                          className="flex items-center gap-2"
                          variants={benefitAnimation}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-primary text-lg">✓</span>
                          <span>
                            Actualizaciones incluidas durante tu suscripción
                          </span>
                        </motion.div>
                      </motion.div>
                    </div>
                    <ShareButtons course={course} />
                  </div>
                </CardContent>
              </Card>

              <TableOfContents
                course={course}
                activeModuleIndex={activeModuleIndex}
                onModuleClick={setActiveModuleIndex}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
