import { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";

type ApiError = {
  message: string;
  error?: string;
  code?: string;
  statusCode?: number;
  constraint?: string;
};

const getFriendlyErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;

    // Errores específicos de Postgres/Drizzle
    if (data?.constraint?.includes("categories_parent_id")) {
      return "No se puede eliminar la categoría porque tiene subcategorías asociadas";
    }
    if (data?.code === "P2003") {
      return "No se puede eliminar porque tiene elementos relacionados";
    }

    // Si tenemos un mensaje específico del servidor, lo usamos
    if (data?.message) {
      return data.message;
    }

    // Si tenemos un error específico del servidor, lo usamos
    if (data?.error) {
      return data.error;
    }

    // Si es un error de red o similar
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ha ocurrido un error inesperado";
};

export const catchAxiosError = (error: unknown) => {
  const errorMessage = getFriendlyErrorMessage(error);

  if (process.env.NODE_ENV !== "production") {
    console.error("Error completo:", error);
    if (error instanceof AxiosError) {
      console.error("Datos de la respuesta:", error.response?.data);
    }
  }

  return toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
};
