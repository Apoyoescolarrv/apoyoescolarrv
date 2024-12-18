"use client";

import { useTheme } from "next-themes";

import { Moon, Sun, Laptop } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <ToggleGroup
      type="single"
      defaultValue="system"
      onValueChange={(value) => setTheme(value)}
    >
      <ToggleGroupItem value="light">
        <Sun className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark">
        <Moon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="system">
        <Laptop className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
