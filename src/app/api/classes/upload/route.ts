import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/verify-token";
import { buildEndpoint } from "@/lib/build-endpoint";

export const POST = buildEndpoint(
  verifyToken(async (req, userId, isAdmin) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para subir videos" },
        { status: 403 }
      );
    }

    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validar que sea un video
    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "El archivo debe ser un video" },
        { status: 400 }
      );
    }

    // Subir a Vercel Blob
    const blob = await put(`classes/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  }),
  { errorMessage: "Error al subir el video" }
);

export const DELETE = buildEndpoint(
  verifyToken(async (req, userId, isAdmin) => {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar videos" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL es requerida" }, { status: 400 });
    }

    await del(url);

    return new NextResponse(null, { status: 204 });
  }),
  { errorMessage: "Error al eliminar el video" }
);
