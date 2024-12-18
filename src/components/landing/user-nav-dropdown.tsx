"use client";

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/logout";
import { User } from "@/types/user";
import Link from "next/link";

export default function UserNavDropdown({ user }: { user: User }) {
  return (
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/profile">Perfil</Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/my-courses">Mis Cursos</Link>
      </DropdownMenuItem>
      {user.isAdmin && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/admin" className="text-primary">
              Administrador del Sitio
            </Link>
          </DropdownMenuItem>
        </>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => logout()}>
        Cerrar Sesión
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
