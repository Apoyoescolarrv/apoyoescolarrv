import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.JWT_SECRET!;

interface JwtPayload {
  userId: string;
  isAdmin: boolean;
}

export const verifyToken = (
  handler: (
    req: NextRequest,
    userId: string,
    isAdmin: boolean
  ) => Promise<NextResponse>
) => {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Token faltante" }, { status: 401 });
    }

    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, secret) as JwtPayload;
      if (!decoded.userId) {
        throw new Error("Token inválido");
      }
      return handler(req, decoded.userId, decoded.isAdmin);
    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
  };
};
