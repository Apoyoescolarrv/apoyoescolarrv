import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDuration } from "@/lib/format";
import { Course } from "@/types/course";
import { Clock, GraduationCap, Play, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface CourseCardProps {
  course: Course;
  categoryName?: string;
  isOwned?: boolean;
}

export default function CourseCard({
  course,
  categoryName,
  isOwned = false,
}: CourseCardProps) {
  const router = useRouter();

  const handleCardClick = useCallback(() => {
    const path = isOwned
      ? `/courses/${course.id}/learn`
      : `/courses/${course.id}`;
    router.push(path);
  }, [course.id, isOwned, router]);

  return (
    <Card
      onClick={handleCardClick}
      key={course.id}
      className="group flex cursor-pointer flex-col overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden">
        {course.thumbnail && (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {categoryName && (
          <Badge variant="secondary" className="absolute top-4 left-4 z-10">
            {categoryName}
          </Badge>
        )}
        <Badge className="absolute top-4 right-4 z-10 bg-black/75 hover:bg-black/85">
          {formatCurrency(course.price ?? 0)}
        </Badge>
      </div>

      <CardHeader className="space-y-2">
        <h2 className="text-xl font-semibold leading-none">{course.title}</h2>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {course.description}
        </p>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(course.totalDuration ?? 0)}</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span>{course._count?.modules ?? 0} módulos</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {(course._count?.students ?? 0) > 0
                ? `${course._count?.students} estudiante${
                    course._count?.students > 1 ? "s" : ""
                  }`
                : "Sé el primero"}
            </span>
          </div>
        </div>

        {isOwned && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progreso</span>
              <span>0%</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="flex flex-col sm:flex-row gap-2 w-full pt-4">
          <Link
            href={
              isOwned ? `/courses/${course.id}/learn` : `/courses/${course.id}`
            }
            className="w-full"
          >
            <Button
              className="w-full"
              variant={isOwned ? "default" : "secondary"}
            >
              {isOwned && <Play className="h-4 w-4 mr-2" />}
              {isOwned ? "Continuar" : "Ver Detalles"}
            </Button>
          </Link>

          {!isOwned && <AddToCartButton course={course} className="w-full" />}
        </div>
      </CardFooter>
    </Card>
  );
}
