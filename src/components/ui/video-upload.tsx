"use client";

import {
  useUploadVideoMutation,
  useDeleteVideoMutation,
} from "@/api/classes/mutations";
import { useToast } from "@/hooks/use-toast";
import { catchAxiosError } from "@/lib/catch-axios-error";
import { cn } from "@/lib/utils";
import { Upload, X } from "lucide-react";
import { useRef } from "react";
import { Button } from "./button";

interface VideoUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  onDurationChange?: (duration: number) => void;
  className?: string;
  disabled?: boolean;
}

export function VideoUpload({
  value,
  onChange,
  onDurationChange,
  className,
  disabled,
}: VideoUploadProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadVideo, isPending: isUploading } =
    useUploadVideoMutation();
  const { mutateAsync: deleteVideo, isPending: isDeleting } =
    useDeleteVideoMutation();

  const handleVideoUpload = async (file: File) => {
    try {
      const { url } = await uploadVideo(file);
      onChange?.(url);

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

      toast({
        title: "Video subido",
        description: "El video se ha subido correctamente.",
      });
    } catch (error) {
      catchAxiosError(error);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      handleVideoUpload(file);
    } else {
      toast({
        title: "Archivo inválido",
        description: "Por favor, sube un archivo de video.",
        variant: "destructive",
      });
    }
  };

  const handleClear = async () => {
    if (value) {
      try {
        await deleteVideo(value);
        toast({
          title: "Video eliminado",
          description: "El video se ha eliminado correctamente.",
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
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleVideoUpload(file);
            }
          }}
          disabled={disabled || isUploading}
        />

        {value ? (
          <>
            <video
              ref={videoRef}
              src={value}
              controls
              className="max-h-[200px] w-full"
            />
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
                <p>Subiendo video...</p>
              ) : (
                <>
                  <p>Arrastra y suelta un video aquí o</p>
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
