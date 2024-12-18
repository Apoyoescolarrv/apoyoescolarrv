import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export function CoursesListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="flex flex-col overflow-hidden">
          <div className="relative aspect-video bg-muted animate-pulse" />
          <CardHeader className="space-y-2">
            <div className="h-6 w-2/3 bg-muted animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-4 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <div className="grid grid-cols-2 gap-4 w-full pt-4">
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
