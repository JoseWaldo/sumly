import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
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
import { CurrencyInput } from "@/components/ui/currency-input";
import { DateInput } from "@/components/ui/date-input";
import { LazyIcon } from "@/features/categories/components/icon-picker";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { todayCol } from "@/lib/date-utils";
import {
  transactionFormSchema,
  type TransactionFormInput,
  type Transaction,
} from "@/features/transactions/schemas/transaction.schema";

interface TransactionFormProps {
  defaultValues?: Transaction | null;
  defaultType?: "INCOME" | "EXPENSE";
  onSubmit: (data: TransactionFormInput) => Promise<void>;
  isLoading?: boolean;
}

export function TransactionForm({ defaultValues, defaultType, onSubmit, isLoading }: TransactionFormProps) {
  const [categorySearch, setCategorySearch] = useState("");

  const { data: categoriesData } = useCategories({
    type: defaultType,
    search: categorySearch || undefined,
    page: 1,
    limit: 100,
  });

  const categories = useMemo(() => categoriesData?.data ?? [], [categoriesData]);

  const form = useForm<TransactionFormInput>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: defaultValues?.amount ?? ("" as unknown as number),
      date: defaultValues?.date ? defaultValues.date.split("T")[0] : todayCol(),
      description: defaultValues?.description ?? "",
      categoryId: defaultValues?.categoryId ?? "",
    },
  });

  const handleSubmit = async (data: TransactionFormInput) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <CurrencyInput
                  value={field.value ?? 0}
                  onChange={field.onChange}
                  placeholder="0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <DateInput value={field.value} onChange={field.onChange} />
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
              <FormLabel>Descripcion (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Supermercado" {...field} />
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
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar categoria..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto rounded-md border border-input/50">
                    {categories.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        {defaultType === "INCOME"
                          ? "No tienes categorias de ingreso"
                          : "No tienes categorias de gasto"}
                      </p>
                    ) : (
                      categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => field.onChange(cat.id)}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-accent cursor-pointer ${
                            field.value === cat.id
                              ? "bg-primary/10 text-primary"
                              : "text-foreground"
                          }`}
                        >
                          <LazyIcon name={cat.icon} className="h-4 w-4" />
                          <span>{cat.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting || isLoading}>
            {form.formState.isSubmitting || isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
