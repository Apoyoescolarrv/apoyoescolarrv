import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SortOption } from "@/types/sort";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronDown,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

export const sortOptionsConfig: Record<
  SortOption,
  { label: string; icon?: React.ReactNode }
> = {
  "price-asc": {
    label: "Precio: Menor a mayor",
    icon: <ArrowUpAZ className="h-4 w-4" />,
  },
  "price-desc": {
    label: "Precio: Mayor a menor",
    icon: <ArrowDownAZ className="h-4 w-4" />,
  },
  "title-asc": {
    label: "Título: A-Z",
    icon: <ArrowUpAZ className="h-4 w-4" />,
  },
  "title-desc": {
    label: "Título: Z-A",
    icon: <ArrowDownAZ className="h-4 w-4" />,
  },
  "students-desc": { label: "Más populares" },
  "progress-asc": { label: "Progreso: Menor a mayor" },
  "progress-desc": { label: "Progreso: Mayor a menor" },
  "lastAccessed-desc": { label: "Último acceso" },
};

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Buscar cursos..."
        clearable
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}

interface SortMenuProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  options: readonly SortOption[];
}

export function SortMenu({ value, onChange, options }: SortMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" data-sort={value}>
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden md:block">Ordenar</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const config = sortOptionsConfig[option];
          return (
            <DropdownMenuItem
              key={option}
              onClick={() => onChange(option)}
              className="gap-2"
            >
              {config.icon}
              {config.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface CategoryMenuProps {
  categories: Array<{ id: string; name: string }>;
  selectedCategories: string[];
  onToggle: (categoryId: string) => void;
}

export function CategoryMenu({
  categories,
  selectedCategories,
  onToggle,
}: CategoryMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden md:block">Filtros</span>
          {selectedCategories.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedCategories.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Categorías</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {categories.map((category) => (
          <DropdownMenuItem
            key={category.id}
            onClick={() => onToggle(category.id)}
            className="gap-2"
          >
            <div
              className={cn(
                "h-4 w-4 border rounded-sm",
                selectedCategories.includes(category.id) &&
                  "bg-primary border-primary"
              )}
            />
            {category.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface FilterBadgesProps {
  selectedCategories: string[];
  categories: Array<{ id: string; name: string }>;
  onCategoryToggle: (categoryId: string) => void;
  onClearAll: () => void;
}

export function FilterBadges({
  selectedCategories,
  categories,
  onCategoryToggle,
  onClearAll,
}: FilterBadgesProps) {
  if (selectedCategories.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {selectedCategories.map((categoryId) => {
        const category = categories.find((c) => c.id === categoryId);
        if (!category) return null;
        return (
          <Badge
            key={categoryId}
            variant="secondary"
            className="gap-1"
            onClick={() => onCategoryToggle(categoryId)}
          >
            {category.name}
            <X className="h-3 w-3" />
          </Badge>
        );
      })}
      <Button variant="ghost" size="sm" onClick={onClearAll}>
        Limpiar filtros
      </Button>
    </div>
  );
}
