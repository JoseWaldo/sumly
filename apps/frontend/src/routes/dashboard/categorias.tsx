import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useMemo } from "react";
import { Plus, Search, X, FilterX, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CategoriesTable } from "@/features/categories/components/categories-table";
import { CategoriesTableSkeleton } from "@/features/categories/components/categories-table-skeleton";
import { CategoryForm } from "@/features/categories/components/category-form";
import { DeleteCategoryDialog } from "@/features/categories/components/delete-category-dialog";
import { Dialog } from "@/features/categories/components/category-dialog";
import { FilterSheet } from "@/components/ui/filter-sheet";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/features/categories/hooks/use-categories";
import type { Category, CategoryFormInput } from "@/features/categories/schemas/category.schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/categorias")({
  component: CategoriasPage,
});

type Tab = "all" | "INCOME" | "EXPENSE";

const tabs: { key: Tab; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "INCOME", label: "Ingresos" },
  { key: "EXPENSE", label: "Gastos" },
];

const sortOptions: { value: string; label: string }[] = [
  { value: "name", label: "Nombre" },
  { value: "type", label: "Tipo" },
];

const PAGE_SIZE = 10;

function CategoriasPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const typeFilter = activeTab === "all" ? undefined : activeTab;
  const { data: paginated, isLoading } = useCategories({
    type: typeFilter,
    search: search || undefined,
    sortBy,
    sortDir,
    page,
    limit: PAGE_SIZE,
  });

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const categories = paginated?.data ?? [];
  const total = paginated?.total ?? 0;
  const totalPages = paginated?.totalPages ?? 1;

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setActiveTab("all");
    setSortBy("name");
    setSortDir("asc");
    setPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeTab !== "all") count++;
    if (sortBy !== "name" || sortDir !== "asc") count++;
    return count;
  }, [activeTab, sortBy, sortDir]);

  function openCreate() {
    setEditingCategory(null);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditingCategory(category);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingCategory(null);
  }

  async function handleCreate(data: CategoryFormInput) {
    await createMutation.mutateAsync(data);
    closeForm();
  }

  async function handleUpdate(data: CategoryFormInput) {
    if (!editingCategory) return;
    await updateMutation.mutateAsync({ id: editingCategory.id, data });
    closeForm();
  }

  async function handleDelete() {
    if (!deletingCategory) return;
    await deleteMutation.mutateAsync(deletingCategory.id);
    setDeletingCategory(null);
    if (categories.length === 1 && page > 1) {
      setPage(page - 1);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-normal tracking-tight">Categorias</h2>
          <p className="text-muted-foreground">Gestiona las categorias de tus ingresos y gastos.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nueva categoria
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar categoria..."
                className="pl-8 pr-8"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Button variant="outline" size="icon" onClick={() => setSheetOpen(true)} className="relative shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 shrink-0 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <FilterX className="h-3.5 w-3.5" />
                Limpiar
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <CategoriesTableSkeleton />
          ) : (
            <CategoriesTable
              categories={categories}
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={setPage}
              onEdit={openEdit}
              onDelete={(cat) => setDeletingCategory(cat)}
            />
          )}
        </CardContent>
      </Card>

      <Dialog
        open={formOpen}
        onClose={closeForm}
        title={editingCategory ? "Editar categoria" : "Nueva categoria"}
      >
        <CategoryForm
          defaultValues={editingCategory}
          onSubmit={editingCategory ? handleUpdate : handleCreate}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Dialog>

      <DeleteCategoryDialog
        open={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        categoryName={deletingCategory?.name ?? ""}
        isLoading={deleteMutation.isPending}
      />

      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <FilterSheet.Header onClose={() => setSheetOpen(false)} />
        <FilterSheet.Body>
          <FilterSheet.Section label="Tipo">
            <div className="flex gap-1.5">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTabChange(key)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                    activeTab === key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input/40 text-muted-foreground hover:border-input hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </FilterSheet.Section>

          <FilterSheet.Section label="Ordenar por">
            <div className="space-y-2">
              <div className="flex gap-1.5">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSort(opt.value)}
                    className={cn(
                      "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                      sortBy === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input/40 text-muted-foreground hover:border-input hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setSortDir("asc")}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5",
                    sortDir === "asc"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input/40 text-muted-foreground hover:border-input hover:text-foreground"
                  )}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  A - Z
                </button>
                <button
                  type="button"
                  onClick={() => setSortDir("desc")}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5",
                    sortDir === "desc"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input/40 text-muted-foreground hover:border-input hover:text-foreground"
                  )}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  Z - A
                </button>
              </div>
            </div>
          </FilterSheet.Section>
        </FilterSheet.Body>
        <FilterSheet.Footer>
          <button
            type="button"
            onClick={clearFilters}
            className="flex-1 rounded-lg border border-border/30 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            Limpiar filtros
          </button>
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
          >
            Aplicar
          </button>
        </FilterSheet.Footer>
      </FilterSheet>
    </div>
  );
}
