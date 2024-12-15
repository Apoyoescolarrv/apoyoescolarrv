import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Sobre Nosotros</h3>
            <p className="text-sm text-muted-foreground">
              Somos una plataforma de aprendizaje en línea dedicada a
              proporcionar educación de calidad para todos.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:underline">
                  Cursos
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Categorías
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Instructores
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: info@lmsplatform.com</li>
              <li>Teléfono: +54 11 1234-5678</li>
              <li>Dirección: Av. Corrientes 1234, CABA</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Síguenos</h3>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} LMS Platform. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
}
