import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Course } from "@/types/course";
import { List } from "lucide-react";

interface TableOfContentsProps {
  course: Course;
  activeModuleIndex: number;
  onModuleClick: (index: number) => void;
}

export function TableOfContents({
  course,
  activeModuleIndex,
  onModuleClick,
}: TableOfContentsProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <List className="h-5 w-5" />
          Contenido del curso
        </CardTitle>
        <p className="text-sm text-gray-500">
          {course.modules?.length} módulos
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <nav className="space-y-1">
          {course.modules?.map((module, index) => (
            <button
              key={module.id}
              onClick={() => onModuleClick(index)}
              className={`text-sm w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors ${
                activeModuleIndex === index
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-50"
              }`}
            >
              <span className="text-sm w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                {index + 1}
              </span>
              <span className="line-clamp-1">{module.title}</span>
            </button>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}
