import { Skeleton } from "@/components/ui/skeleton";

export default function CourseLoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Main Content */}
        <main className="w-full lg:flex-1">
          <div className="container max-w-6xl py-4 lg:py-6 px-4">
            {/* Video Player Skeleton */}
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg animate-pulse" />
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
        <aside className="w-full lg:max-w-[400px] border-t lg:border-t-0 lg:border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-4 lg:p-6">
            {/* Course Progress */}
            <div className="mb-6 space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-8" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>

            {/* Module List */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-1.5">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="flex items-center gap-2 p-2 rounded-lg"
                      >
                        <Skeleton className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-1">
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
        </aside>
      </div>
    </div>
  );
}
