import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { User } from "@/types/user";
import Image from "next/image";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const decoded = jwtDecode<User>(token);
  return decoded;
}

export async function Header() {
  const user = await getUser();

  return (
    <header className="border-b bg-primary text-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/">
          <Image src="/logo.svg" alt="Logo" width={150} height={32} />
        </Link>
        <nav className="hidden space-x-4 md:flex">
          <Link href="/courses" className="text-sm font-medium hover:underline">
            Cursos
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline">
            Categorías
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline">
            Sobre Nosotros
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline">
            Contacto
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          {user ? (
            <UserNav user={user} />
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Registrarse</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
