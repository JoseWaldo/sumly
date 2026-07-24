import { Suspense, lazy, useMemo, useState, useRef, useEffect } from "react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const iconNames = Object.keys(dynamicIconImports).sort();

const lazyIconCache = new Map<string, React.LazyExoticComponent<React.ComponentType<React.SVGProps<SVGSVGElement>>>>();

function getLazyIcon(name: string) {
  const cached = lazyIconCache.get(name);
  if (cached) return cached;
  const importFn = dynamicIconImports[name as keyof typeof dynamicIconImports];
  if (!importFn) return null;
  const component = lazy(importFn);
  lazyIconCache.set(name, component);
  return component;
}

interface LazyIconProps {
  name: string;
  className?: string;
}

export function LazyIcon({ name, className }: LazyIconProps) {
  const Icon = useMemo(() => getLazyIcon(name), [name]);
  if (!Icon) return null;

  return (
    <Suspense fallback={<div className={cn("h-4 w-4 rounded-sm bg-muted/50", className)} />}>
      <Icon className={className} />
    </Suspense>
  );
}

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filteredIcons = useMemo(() => {
    if (!query) return iconNames.slice(0, 120);
    const lower = query.toLowerCase();
    return iconNames.filter((name) => name.toLowerCase().includes(lower)).slice(0, 120);
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input/50 bg-transparent px-3 py-1 text-sm transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        )}
      >
        <div className="flex items-center gap-2">
          <LazyIcon name={value} className="h-4 w-4" />
          <span className="text-muted-foreground">{value || "Seleccionar icono"}</span>
        </div>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 rounded-md border border-border/50 bg-card shadow-lg" style={{ width: "280px" }}>
          <div className="flex items-center border-b border-border/30 px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar icono..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto p-2">
            {filteredIcons.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-accent cursor-pointer",
                  value === name && "bg-primary/20 text-primary ring-1 ring-primary/30"
                )}
                title={name}
              >
                <LazyIcon name={name} className="h-4 w-4" />
              </button>
            ))}
            {filteredIcons.length === 0 && (
              <div className="col-span-8 py-4 text-center text-sm text-muted-foreground">
                Sin resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
