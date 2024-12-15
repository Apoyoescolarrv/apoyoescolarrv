import { getCategories } from "@/api/categories";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Category } from "@/types/category";
import { BookOpen } from "lucide-react";
import { Suspense } from "react";

async function CategoryList() {
  const { categories } = await getCategories();

  if (categories.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
        Explora nuestras categorías
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category: Category) => (
          <Card key={category.id} className="overflow-hidden">
            <div className="bg-primary p-6">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-2 p-6">
              <h3 className="text-xl font-bold">{category.name}</h3>
              <Button className="w-full" variant="outline">
                Ver Cursos
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function CategorySkeleton() {
  return (
    <>
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
        Explora nuestras categorías
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="bg-primary/10 p-6">
              <Skeleton className="h-12 w-12" />
            </div>
            <div className="space-y-2 p-6">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export default async function Categories() {
  const { categories } = await getCategories();

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="px-4 py-16 md:py-24">
      <div className="container mx-auto">
        <Suspense fallback={<CategorySkeleton />}>
          <CategoryList />
        </Suspense>
      </div>
    </section>
  );
}
