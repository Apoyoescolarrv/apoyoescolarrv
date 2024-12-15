import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";

const secret = process.env.JWT_SECRET!;

interface JwtPayload {
  userId: string;
}

export const verifyToken = (
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
) => {
  return async (req: NextRequest) => {
    console.log("verifying token");
    const authHeader = (await headers()).get("authorization");

    console.log({ authHeader });

    if (!authHeader) {
      return NextResponse.json(
        { error: "Falta el encabezado de autorización" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    console.log({ token });
    if (!token) {
      return NextResponse.json({ error: "Token faltante" }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      if (!decoded.userId) {
        throw new Error("Token inválido");
      }
      return handler(req, decoded.userId);
    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
  };
};
