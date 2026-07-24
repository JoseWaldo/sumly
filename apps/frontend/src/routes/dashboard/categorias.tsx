import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoriesTable } from "@/features/categories/components/categories-table";
import { CategoriesTableSkeleton } from "@/features/categories/components/categories-table-skeleton";
import { CategoryForm } from "@/features/categories/components/category-form";
import { DeleteCategoryDialog } from "@/features/categories/components/delete-category-dialog";
import { Dialog } from "@/features/categories/components/category-dialog";
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

const PAGE_SIZE = 10;

function CategoriasPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const typeFilter = activeTab === "all" ? undefined : activeTab;
  const { data: paginated, isLoading } = useCategories({
    type: typeFilter,
    search: search || undefined,
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg border border-border/30 bg-muted/50 p-1 w-fit">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTabChange(key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                activeTab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar categoria..."
            className="pl-9 pr-8"
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
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {total} categoria{total !== 1 ? "s" : ""}
          </CardTitle>
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
    </div>
  );
}
