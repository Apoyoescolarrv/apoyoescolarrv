"use client";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/api/categories/mutations";
import { useCategoriesQuery } from "@/api/categories/query";
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
import { useToast } from "@/hooks/use-toast";
import { catchAxiosError } from "@/lib/catch-axios-error";
import { Category } from "@/types/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  parentId: z.string().optional(),
});

interface CategoryFormProps {
  onSuccess?: () => void;
  category?: Category;
}

export function CategoryForm({ onSuccess, category }: CategoryFormProps) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const { data: categories = [] } = useCategoriesQuery();
  const { mutateAsync: createCategory } = useCreateCategoryMutation();
  const { mutateAsync: updateCategory } = useUpdateCategoryMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      parentId: category?.parentId || undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        if (category) {
          await updateCategory({ id: category.id, ...values });
          toast({
            title: "Categoría actualizada",
            description: "La categoría se ha actualizada correctamente.",
          });
        } else {
          await createCategory(values);
          toast({
            title: "Categoría creada",
            description: "La categoría se ha creado correctamente.",
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Categoría</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Matemáticas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría Padre (Opcional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                disabled={categories.length === 0}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría padre" />
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
        <Button isLoading={pending} type="submit" disabled={pending}>
          {category ? "Actualizar" : "Crear"} Categoría
        </Button>
      </form>
    </Form>
  );
}
