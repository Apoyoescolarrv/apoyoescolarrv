import { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";

type ApiError = {
  error: string;
  details?: string;
  status?: number;
};

export const catchAxiosError = (error: unknown) => {
  let errorMessage = "Ha ocurrido un error inesperado";

  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;

    if (data?.error) {
      errorMessage = data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(error, errorMessage);
  }

  return toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
};
