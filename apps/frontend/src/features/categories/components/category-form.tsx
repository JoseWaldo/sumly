import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Select } from "@/components/ui/select";
import { IconPicker } from "@/features/categories/components/icon-picker";
import {
  categoryFormSchema,
  type CategoryFormInput,
  type Category,
} from "@/features/categories/schemas/category.schema";

interface CategoryFormProps {
  defaultValues?: Category | null;
  onSubmit: (data: CategoryFormInput) => Promise<void>;
  isLoading?: boolean;
}

export function CategoryForm({ defaultValues, onSubmit, isLoading }: CategoryFormProps) {
  const form = useForm<CategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      type: defaultValues?.type ?? ("EXPENSE" as const),
      icon: defaultValues?.icon ?? "Tag",
    },
  });

  const handleSubmit = async (data: CategoryFormInput) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Subscripciones" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onChange={field.onChange}
                >
                  <option value="INCOME">Ingreso</option>
                  <option value="EXPENSE">Gasto</option>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icono</FormLabel>
              <FormControl>
                <IconPicker value={field.value} onChange={field.onChange} />
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
