import { useInfiniteClassesQuery } from "@/api/classes/query";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { Class } from "@/types/class";
import { Check } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ClassSelectorProps {
  selectedClasses: Class[];
  onSelectClass: (classItem: Class) => void;
  onRemoveClass: (classId: string) => void;
}

export function ClassSelector({
  selectedClasses,
  onSelectClass,
  onRemoveClass,
}: ClassSelectorProps) {
  const [selectedSearch, setSelectedSearch] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const {
    data: classesData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: isClassesLoading,
  } = useInfiniteClassesQuery({
    search: debouncedSearch,
  });

  const classes = classesData?.pages.flatMap((page) => page.data) || [];

  const filteredSelectedClasses = selectedClasses.filter((classItem) =>
    classItem.title.toLowerCase().includes(selectedSearch.toLowerCase())
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom =
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
      e.currentTarget.clientHeight;
    if (bottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          placeholder="Buscar en clases seleccionadas..."
          value={selectedSearch}
          onChange={(e) => setSelectedSearch(e.target.value)}
          className="w-full"
        />
        <div className="flex flex-col gap-2">
          {filteredSelectedClasses.map((classItem) => (
            <div
              key={classItem.id}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <span className="text-sm">{classItem.title}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveClass(classItem.id)}
              >
                Quitar
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Command className="rounded-lg border shadow-md">
        <CommandInput
          placeholder="Buscar clases..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList className="max-h-[300px]" onScroll={handleScroll}>
          {isClassesLoading ? (
            <div className="p-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="mt-2 h-8 w-full" />
              <Skeleton className="mt-2 h-8 w-full" />
            </div>
          ) : (
            <>
              <CommandEmpty>No se encontraron clases</CommandEmpty>
              <CommandGroup>
                {classes.map((classItem) => {
                  const isSelected = selectedClasses.some(
                    (c) => c.id === classItem.id
                  );
                  return (
                    <CommandItem
                      key={classItem.id}
                      value={classItem.title}
                      onSelect={() => {
                        if (!isSelected) {
                          onSelectClass(classItem);
                        } else {
                          onRemoveClass(classItem.id);
                        }
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{classItem.title}</span>
                        <span className="text-xs text-muted-foreground">
                          Duración: {classItem.duration}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}
          {isFetchingNextPage && (
            <div className="py-2 text-center text-sm text-muted-foreground">
              Cargando más clases...
            </div>
          )}
        </CommandList>
      </Command>
    </div>
  );
}
