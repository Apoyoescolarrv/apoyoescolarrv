import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { buildEndpoint } from "@/lib/build-endpoint";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/verify-token";

export const GET = buildEndpoint(
  verifyToken(async (req, userId) => {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    console.log({ user });
    return NextResponse.json({ user });
  }),
  {
    errorMessage: "Error al obtener la información del usuario",
  }
);
