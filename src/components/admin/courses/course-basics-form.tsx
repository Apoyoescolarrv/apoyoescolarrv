"use client";

import { useInfiniteCategoriesQuery } from "@/api/categories/query";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CourseFormData } from "@/types/course";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MediaUpload } from "@/components/ui/media-upload";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "El título debe tener al menos 2 caracteres.",
  }),
  description: z.string().default(""),
  price: z.number().min(0, {
    message: "El precio debe ser mayor a 0.",
  }),
  categoryId: z.string().min(1, {
    message: "La categoría es requerida.",
  }),
  isActive: z.boolean().default(false),
  whatsappGroupId: z.string().default(""),
  thumbnail: z.string().default(""),
});

interface CourseBasicsFormProps {
  onSubmit: (data: CourseFormData["basics"]) => void;
  defaultValues?: CourseFormData["basics"];
  formRef: React.RefObject<HTMLFormElement | null>;
}

export function CourseBasicsForm({
  onSubmit,
  defaultValues,
  formRef,
}: CourseBasicsFormProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const debouncedSearch = useDebounce(search, 300);

  const {
    data: categoriesData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: isCategoriesLoading,
  } = useInfiniteCategoriesQuery({
    search: debouncedSearch,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      price: defaultValues?.price || 0,
      categoryId: defaultValues?.categoryId || "",
      isActive: defaultValues?.isActive || false,
      whatsappGroupId: defaultValues?.whatsappGroupId || "",
      thumbnail: defaultValues?.thumbnail || "",
    },
  });

  const categories = categoriesData?.pages.flatMap((page) => page.data) || [];

  const onOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      setSearch("");
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom =
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
      e.currentTarget.clientHeight;
    if (bottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(() => {
      onSubmit(values);
    });
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del Curso</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Matemáticas Básicas" {...field} />
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
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="thumbnail"
            render={({ field }) => (
              <FormItem className="h-full">
                <FormLabel>Imagen de Portada</FormLabel>
                <FormControl>
                  <MediaUpload
                    type="image"
                    value={field.value}
                    onChange={field.onChange}
                    accept="image/jpeg,image/png,image/webp"
                    disabled={pending}
                    className="h-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-7"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? Number(value) : 0);
                      }}
                    />
                  </div>
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
                <Popover open={open} onOpenChange={onOpenChange}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isCategoriesLoading}
                      >
                        {isCategoriesLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : field.value ? (
                          categories.find(
                            (category) => category.id === field.value
                          )?.name
                        ) : (
                          "Selecciona una categoría"
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Buscar categoría..."
                        value={search}
                        onValueChange={setSearch}
                      />
                      <CommandList onScroll={handleScroll}>
                        {isCategoriesLoading ? (
                          <div className="p-2">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="mt-2 h-8 w-full" />
                            <Skeleton className="mt-2 h-8 w-full" />
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>
                              No se encontraron categorías
                            </CommandEmpty>
                            <CommandGroup>
                              {categories.map((category) => (
                                <CommandItem
                                  key={category.id}
                                  value={category.name}
                                  onSelect={() => {
                                    form.setValue("categoryId", category.id);
                                    setOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      category.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {category.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                        {isFetchingNextPage && (
                          <div className="py-2 text-center text-sm text-muted-foreground">
                            Cargando más categorías...
                          </div>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Curso Activo</FormLabel>
                <FormDescription>
                  Al activar el curso, estará visible para los estudiantes y
                  podrán comprarlo. Asegúrate de haber configurado todo
                  correctamente antes de activarlo.
                </FormDescription>
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

        <FormField
          control={form.control}
          name="whatsappGroupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID del Grupo de WhatsApp</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: JtD6iPCiFtNCuGcKkdiMgR"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Ingresa el ID del grupo de WhatsApp (formato: XXXXXXXXX).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
