"use client";

import {
  useCreateClassMutation,
  useUpdateClassMutation,
} from "@/api/classes/mutations";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { VideoUpload } from "@/components/ui/video-upload";
import { useToast } from "@/hooks/use-toast";
import { catchAxiosError } from "@/lib/catch-axios-error";
import { formatDuration, parseDuration } from "@/lib/utils";
import { Class } from "@/types/class";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "El título debe tener al menos 2 caracteres.",
  }),
  description: z.string().nullable(),
  videoUrl: z.string().url({
    message: "Debe ser una URL válida",
  }),
  duration: z.number().min(0).nullable(),
  isPreview: z.boolean().default(false),
});

interface ClassFormProps {
  onSuccess?: () => void;
  class?: Class;
}

export function ClassForm({ onSuccess, class: editingClass }: ClassFormProps) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const { mutateAsync: createClass } = useCreateClassMutation();
  const { mutateAsync: updateClass } = useUpdateClassMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: editingClass?.title || "",
      description: editingClass?.description || null,
      videoUrl: editingClass?.videoUrl || "",
      duration: editingClass?.duration || null,
      isPreview: editingClass?.isPreview || false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        if (editingClass) {
          await updateClass({ id: editingClass.id, ...values });
          toast({
            title: "Clase actualizada",
            description: "La clase se ha actualizado correctamente.",
          });
        } else {
          await createClass(values);
          toast({
            title: "Clase creada",
            description: "La clase se ha creado correctamente.",
          });
        }
        onSuccess?.();
        form.reset();
      } catch (error) {
        catchAxiosError(error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título de la Clase</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Algebra Lineal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el contenido de la clase..."
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video</FormLabel>
              <FormControl>
                <VideoUpload
                  value={field.value}
                  onChange={(url) => {
                    field.onChange(url);
                    if (!url) {
                      form.setValue("duration", null);
                    }
                  }}
                  onDurationChange={(duration) => {
                    form.setValue("duration", duration, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  disabled={pending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duración</FormLabel>
              <FormControl>
                <Input
                  placeholder="00:00:00"
                  disabled
                  readOnly
                  {...field}
                  value={field.value ? formatDuration(field.value) : ""}
                  onChange={(e) => {
                    const seconds = parseDuration(e.target.value);
                    field.onChange(seconds);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPreview"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Vista Previa</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" isLoading={pending} disabled={pending}>
          {editingClass ? "Actualizar" : "Crear"} Clase
        </Button>
      </form>
    </Form>
  );
}
