import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CourseLoadingSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container max-w-6xl py-6">
          {/* Video Player Skeleton */}
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar */}
      <aside className="w-full lg:w-[400px] border-l">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Course Progress */}
            <div className="mb-6 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>

            {/* Module List */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="flex items-center gap-2 p-2">
                        <Skeleton className="h-4 w-4" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}
