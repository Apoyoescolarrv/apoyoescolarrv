"use client";

import {
  useUploadMediaMutation,
  useDeleteMediaMutation,
} from "@/api/classes/mutations";
import { useToast } from "@/hooks/use-toast";
import { catchAxiosError } from "@/lib/catch-axios-error";
import { cn } from "@/lib/utils";
import { Upload, X } from "lucide-react";
import { useRef } from "react";
import { Button } from "./button";
import Image from "next/image";

interface MediaUploadProps {
  value?: string | null;
  onChange?: (url: string) => void;
  onDurationChange?: (duration: number) => void;
  className?: string;
  disabled?: boolean;
  type: "video" | "image";
  accept?: string;
}

export function MediaUpload({
  value,
  onChange,
  onDurationChange,
  className,
  disabled,
  type,
  accept,
}: MediaUploadProps) {
  const { toast } = useToast();
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadMedia, isPending: isUploading } =
    useUploadMediaMutation();
  const { mutateAsync: deleteMedia, isPending: isDeleting } =
    useDeleteMediaMutation();

  const handleMediaUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const { url } = await uploadMedia(formData);
      onChange?.(url);

      if (type === "video") {
        // Crear un objeto URL para el archivo local
        const videoUrl = URL.createObjectURL(file);

        // Crear un elemento de video temporal para obtener la duración
        const video = document.createElement("video");
        video.src = videoUrl;

        video.onloadedmetadata = () => {
          // Guardar la duración exacta en segundos
          const durationInSeconds = Math.floor(video.duration);
          onDurationChange?.(durationInSeconds);
          URL.revokeObjectURL(videoUrl);
        };

        video.onerror = () => {
          URL.revokeObjectURL(videoUrl);
          toast({
            title: "Error",
            description: "No se pudo obtener la duración del video.",
            variant: "destructive",
          });
        };

        // Necesario para cargar los metadatos
        video.load();
      }

      toast({
        title: `${type === "video" ? "Video" : "Imagen"} subido`,
        description: `El ${
          type === "video" ? "video" : "la imagen"
        } se ha subido correctamente.`,
      });
    } catch (error) {
      catchAxiosError(error);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files[0];
    if (
      file &&
      ((type === "video" && file.type.startsWith("video/")) ||
        (type === "image" && file.type.startsWith("image/")))
    ) {
      handleMediaUpload(file);
    } else {
      toast({
        title: "Archivo inválido",
        description: `Por favor, sube un ${
          type === "video" ? "video" : "una imagen"
        }.`,
        variant: "destructive",
      });
    }
  };

  const handleClear = async () => {
    if (value) {
      try {
        await deleteMedia(value);
        toast({
          title: `${type === "video" ? "Video" : "Imagen"} eliminado`,
          description: `El ${
            type === "video" ? "video" : "la imagen"
          } se ha eliminado correctamente.`,
        });
      } catch (error) {
        catchAxiosError(error);
      }
    }

    onChange?.("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          disabled || isUploading || isDeleting
            ? "cursor-not-allowed bg-muted/50"
            : "cursor-pointer hover:bg-muted/50",
          value && "border-solid bg-muted/50"
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() =>
          !disabled && !isUploading && !isDeleting && inputRef.current?.click()
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept || (type === "video" ? "video/*" : "image/*")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleMediaUpload(file);
            }
          }}
          disabled={disabled || isUploading}
        />

        {value ? (
          <>
            {type === "video" ? (
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={value}
                controls
                className="max-h-[200px] w-full"
              />
            ) : (
              <Image
                ref={mediaRef as React.RefObject<HTMLImageElement>}
                src={value}
                alt="Thumbnail"
                width={400}
                height={200}
                className="max-h-[200px] w-full object-cover"
              />
            )}
            {!disabled && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClear();
                }}
                disabled={isDeleting}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <div className="text-center">
              {isUploading ? (
                <p>Subiendo {type === "video" ? "video" : "imagen"}...</p>
              ) : (
                <>
                  <p>
                    Arrastra y suelta{" "}
                    {type === "video" ? "un video" : "una imagen"} aquí o
                  </p>
                  <p className="font-medium text-primary">
                    haz clic para buscar
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
