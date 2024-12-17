"use client";

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
import { cn } from "@/lib/utils";
import { CourseModule } from "@/types/course";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Plus, Trash } from "lucide-react";
import { Control, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const moduleSchema = z.object({
  modules: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1, "El título es requerido"),
      order: z.number(),
      courseId: z.string().optional(),
    })
  ),
});

type ModulesForm = z.infer<typeof moduleSchema>;

interface CourseModulesFormProps {
  onSubmit: (modules: CourseModule[]) => void;
  defaultValues?: CourseModule[];
  formRef: React.RefObject<HTMLFormElement | null>;
}

interface SortableModuleItemProps {
  id: string;
  index: number;
  isFirst: boolean;
  isDisabled: boolean;
  onRemove: () => void;
  control: Control<ModulesForm>;
}

function SortableModuleItem({
  id,
  index,
  isFirst,
  isDisabled,
  onRemove,
  control,
}: SortableModuleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-4 rounded-lg border p-4",
        isDragging && "opacity-50"
      )}
    >
      <div {...attributes} {...listeners} className="cursor-move">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      <FormField
        control={control}
        name={`modules.${index}.title`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel className={!isFirst ? "sr-only" : ""}>
              Título del Módulo
            </FormLabel>
            <FormControl>
              <Input
                placeholder={`Módulo ${index + 1}`}
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="shrink-0"
        disabled={isDisabled}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function CourseModulesForm({
  onSubmit,
  defaultValues = [],
  formRef,
}: CourseModulesFormProps) {
  const form = useForm<ModulesForm>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      modules:
        defaultValues.length > 0 ? defaultValues : [{ title: "", order: 0 }],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "modules",
    keyName: "fieldId",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.fieldId === active.id);
      const newIndex = fields.findIndex((field) => field.fieldId === over.id);
      move(oldIndex, newIndex);
    }
  };

  const handleSubmit = (data: ModulesForm) => {
    const modules = data.modules.map((module, index) => ({
      ...module,
      order: index,
    }));
    onSubmit(modules);
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((field) => field.fieldId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {fields.map((field, index) => (
                <SortableModuleItem
                  key={field.fieldId}
                  id={field.fieldId}
                  index={index}
                  isFirst={index === 0}
                  isDisabled={fields.length === 1}
                  onRemove={() => remove(index)}
                  control={form.control}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            const newModule = {
              id: `temp-${fields.length}`,
              title: "",
              order: fields.length,
            };
            console.log("Agregando nuevo módulo:", newModule);
            append(newModule);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Módulo
        </Button>
      </form>
    </Form>
  );
}
