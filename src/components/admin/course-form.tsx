"use client";
import { useCategoriesQuery } from "@/api/categories/query";
import {
  useCreateCourseMutation,
  useUpdateCourseMutation,
} from "@/api/courses/mutations";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { catchAxiosError } from "@/lib/catch-axios-error";
import { Course } from "@/types/courses";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "El título debe tener al menos 2 caracteres.",
  }),
  description: z.string().nullable(),
  categoryId: z.string().nullable(),
  price: z.number().min(0),
  isActive: z.boolean().default(true),
  thumbnail: z.string().url().nullable(),
  previewVideoUrl: z.string().url().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface CourseFormProps {
  onSuccess?: () => void;
  course?: Course;
}

export function CourseForm({ onSuccess, course }: CourseFormProps) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const { data: categoriesData } = useCategoriesQuery();
  const { mutateAsync: createCourse } = useCreateCourseMutation();
  const { mutateAsync: updateCourse } = useUpdateCourseMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: course?.title || "",
      description: course?.description || null,
      categoryId: course?.categoryId || null,
      price: course?.price || 0,
      isActive: course?.isActive ?? true,
      thumbnail: course?.thumbnail || null,
      previewVideoUrl: course?.previewVideoUrl || null,
    },
  });

  async function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        if (course) {
          await updateCourse({ id: course.id, ...values });
          toast({
            title: "Curso actualizado",
            description: "El curso se ha actualizado correctamente.",
          });
        } else {
          await createCourse(values);
          toast({
            title: "Curso creado",
            description: "El curso se ha creado correctamente.",
          });
        }
        onSuccess?.();
        form.reset();
      } catch (error) {
        catchAxiosError(error);
      }
    });
  }

  const categories = categoriesData?.data || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del Curso</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Introducción a la Programación"
                  {...field}
                />
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
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el contenido del curso..."
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
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
                disabled={categories.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de la Imagen</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://ejemplo.com/imagen.jpg"
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
          name="previewVideoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL del Video de Preview</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://ejemplo.com/video.mp4"
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
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Activo</FormLabel>
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

        <Button isLoading={pending} type="submit" disabled={pending}>
          {course ? "Actualizar" : "Crear"} Curso
        </Button>
      </form>
    </Form>
  );
}
