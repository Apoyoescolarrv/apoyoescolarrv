import { type User } from "@/types/user";
import { clsx, type ClassValue } from "clsx";
import jwt from "jsonwebtoken";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserInitials(userKey: string) {
  if (!userKey) return "";
  return userKey
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function createToken(user: User) {
  return jwt.sign(
    {
      userId: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1h",
    }
  );
}
