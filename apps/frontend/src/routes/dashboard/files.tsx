import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  FileText,
  Search,
  FilterX,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { FilesTable } from "@/features/files/components/files-table";
import { FilterSheet } from "@/components/ui/filter-sheet";
import { useFiles } from "@/features/files/hooks/use-files";
import type { FileFilters } from "@/features/files/schemas/file.schema";

export const Route = createFileRoute("/dashboard/files")({
  component: FilesPage,
});

const sortOptions = [
  { value: "original_name", label: "Nombre" },
  { value: "size_bytes", label: "Tamano" },
  { value: "mime_type", label: "Tipo" },
  { value: "created_at", label: "Fecha" },
] as const;

function FilesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filters: FileFilters = useMemo(
    () => ({
      search: search || undefined,
      page,
      limit: 10,
      sortBy,
      sortDir,
    }),
    [search, page, sortBy, sortDir]
  );

  const { data, isLoading } = useFiles(filters);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (sortBy !== "created_at") count++;
    if (sortDir !== "desc") count++;
    return count;
  }, [search, sortBy, sortDir]);

  const handleClearFilters = () => {
    setSearch("");
    setSortBy("created_at");
    setSortDir("desc");
    setPage(1);
    setSheetOpen(false);
  };

  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <div>
          <h2 className="text-3xl font-normal tracking-tight">Archivos</h2>
          <p className="text-muted-foreground">
            Gestiona los archivos subidos a tu cuenta.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSheetOpen(true)}
              className="relative shrink-0"
            >
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearFilters}
              >
                <FilterX className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            {data?.total != null
              ? `${data.total} archivo${data.total !== 1 ? "s" : ""}`
              : "Cargando..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FilesTable data={data?.data ?? []} isLoading={isLoading} />

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <FilterSheet.Header onClose={() => setSheetOpen(false)} />
        <FilterSheet.Body>
          <FilterSheet.Section label="Ordenar por">
            <div className="flex flex-wrap gap-1.5">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSortBy(opt.value)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    sortBy === opt.value
                      ? "border border-primary bg-primary/10 text-primary"
                      : "border border-border bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant={sortDir === "asc" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortDir("asc")}
                className="flex-1"
              >
                Ascendente
              </Button>
              <Button
                variant={sortDir === "desc" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortDir("desc")}
                className="flex-1"
              >
                Descendente
              </Button>
            </div>
          </FilterSheet.Section>
        </FilterSheet.Body>
        <FilterSheet.Footer>
          <Button variant="outline" onClick={handleClearFilters}>
            Limpiar filtros
          </Button>
          <Button onClick={() => setSheetOpen(false)}>Aplicar</Button>
        </FilterSheet.Footer>
      </FilterSheet>
    </div>
  );
}
