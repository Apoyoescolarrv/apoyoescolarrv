import { NextRequest, NextResponse } from "next/server";

export const buildEndpoint = (
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
  { errorMessage }: { errorMessage: string } = {
    errorMessage: "Ocurrio un error al procesar la solicitud",
  }
) => {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error(`${errorMessage || "An error occurred"} |`, error);
      return NextResponse.json(
        { error: errorMessage, details: String(error) },
        { status: 500 }
      );
    }
  };
};
