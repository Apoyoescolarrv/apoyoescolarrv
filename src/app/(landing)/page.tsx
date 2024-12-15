import Categories from "@/components/landing/categories";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Button } from "@/components/ui/button";
import { BookOpen, Calculator, Code } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Countdown Timer */}
      <div className="bg-primary px-4 py-2 text-center text-sm text-primary-foreground">
        <p>
          Descuentos exclusivos terminan en:{" "}
          <span className="font-mono font-bold">48:00:00</span>
        </p>
      </div>

      {/* Hero Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-6 text-primary">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Tu plataforma de aprendizaje online
            </h1>
            <p className="text-lg md:text-xl">
              Accede a cientos de cursos, clases grabadas y recursos educativos.
              Aprende a tu ritmo con los mejores profesores.
            </p>
            <Button size="lg" variant="secondary">
              Explorar Cursos
            </Button>
          </div>
          <div className="relative hidden md:block">
            <Image
              src="/landing/teaching.svg"
              alt="Platform Preview"
              width={600}
              height={400}
              className="rounded-lg"
              draggable={false}
              priority
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <Categories />

      {/* Features Section */}
      <section className="border-t bg-muted/50 px-4 py-16 md:py-24">
        <div className="container mx-auto text-center">
          <h2 className="mb-12 text-3xl font-bold tracking-tighter sm:text-4xl">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Contenido de Calidad</h3>
              <p className="text-muted-foreground">
                Cursos actualizados y creados por expertos en cada área
              </p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Code className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Aprendizaje Práctico</h3>
              <p className="text-muted-foreground">
                Ejercicios y proyectos reales para aplicar lo aprendido
              </p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Calculator className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Seguimiento Personalizado</h3>
              <p className="text-muted-foreground">
                Sistema de evaluación y retroalimentación continua
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
